import { getPool, query } from '../config/database';
import { Submission, CreateSubmissionInput } from '../models/submission.model';
import { getOpenSearchClient, SUBMISSIONS_INDEX } from '../config/opensearch';
import { getFormById } from './form.service';
import { zeebeService } from './zeebe.service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

interface SubmissionResult {
  id: string;
  form_id: string;
  data: any;
  submitted_by: string;
  created_at: Date;
  process_instance_key?: string;
  workflow_status: string;
  current_step?: string;
}

interface FormWorkflowConfig {
  id: string;
  slug: string;
  workflow_enabled: boolean;
  workflow_process_id: string | null;
}

/**
 * Get form with workflow configuration
 */
async function getFormWithWorkflow(formId: string): Promise<FormWorkflowConfig | null> {
  const result = await query(
    'SELECT id, slug, workflow_enabled, workflow_process_id FROM forms WHERE id = $1',
    [formId]
  );
  return result.rows[0] || null;
}

/**
 * Create initial approval steps for a submission
 */
async function createApprovalSteps(submissionId: string, processId: string, client: any): Promise<void> {
  // For now, create a simple single-step approval
  // Later this can be configured per form/process
  await client.query(
    `INSERT INTO approval_steps (submission_id, step_name, step_order, status, assigned_to)
     VALUES ($1, 'manager_review', 1, 'pending', 'managers')`,
    [submissionId]
  );
}

/**
 * Create a new submission and optionally start workflow
 */
export async function createSubmission(formId: string, input: CreateSubmissionInput, submittedBy?: string): Promise<Submission> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    const id = uuidv4();

    // 1. Insert submission with initial status
    const insertResult = await client.query(
      `INSERT INTO submissions (id, form_id, data, files, submitted_by, workflow_status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'draft', NOW())
       RETURNING *`,
      [id, formId, JSON.stringify(input.data), JSON.stringify(input.files || []), submittedBy || 'anonymous']
    );

    const row = insertResult.rows[0];
    let processInstanceKey: string | null = null;

    // 2. Check if workflow is enabled
    const formConfig = await getFormWithWorkflow(formId);

    if (formConfig?.workflow_enabled && formConfig.workflow_process_id) {
      try {
        // 3. Start Zeebe process with ONLY submissionId reference
        const processResult = await zeebeService.startProcess(
          formConfig.workflow_process_id,
          id,
          {
            formSlug: formConfig.slug,
            submittedBy: submittedBy || 'anonymous',
          }
        );

        processInstanceKey = processResult.processInstanceKey;

        // 4. Update submission with workflow info
        await client.query(
          `UPDATE submissions
           SET process_instance_key = $1,
               workflow_status = 'in_progress',
               current_step = 'manager_review'
           WHERE id = $2`,
          [processInstanceKey, id]
        );

        // 5. Create approval steps
        await createApprovalSteps(id, formConfig.workflow_process_id, client);

        row.workflow_status = 'in_progress';
        row.current_step = 'manager_review';
        row.process_instance_key = processInstanceKey;

        logger.info(`Submission ${id} started workflow, process: ${processInstanceKey}`);
      } catch (error) {
        // Log error but don't fail the submission
        logger.error(`Failed to start workflow for submission ${id}:`, error);

        await client.query(
          `UPDATE submissions SET workflow_status = 'pending' WHERE id = $1`,
          [id]
        );
        row.workflow_status = 'pending';
      }
    }

    await client.query('COMMIT');

    const submission = mapRowToSubmission(row);

    // Index in OpenSearch
    await indexSubmission(submission, formId);

    return submission;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get submissions by form ID (include workflow info)
 */
export async function getSubmissionsByFormId(formId: string, limit = 50, offset = 0): Promise<{ submissions: Submission[]; total: number }> {
  const countResult = await query('SELECT COUNT(*) FROM submissions WHERE form_id = $1', [formId]);
  const total = parseInt(countResult.rows[0].count);
  const result = await query(
    `SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC LIMIT $2 OFFSET $3`,
    [formId, limit, offset]
  );
  return { submissions: result.rows.map(mapRowToSubmission), total };
}

/**
 * Get submissions for a form (include workflow info)
 */
export async function getSubmissions(formId: string): Promise<SubmissionResult[]> {
  const result = await query(
    `SELECT id, form_id, data, submitted_by, created_at,
            process_instance_key, workflow_status, current_step
     FROM submissions
     WHERE form_id = $1
     ORDER BY created_at DESC`,
    [formId]
  );
  return result.rows;
}

/**
 * Get single submission by ID with approval history
 */
export async function getSubmissionById(id: string): Promise<any | null> {
  const subResult = await query(
    `SELECT id, form_id, data, submitted_by, created_at,
            process_instance_key, workflow_status, current_step, completed_at
     FROM submissions WHERE id = $1`,
    [id]
  );

  if (!subResult.rows[0]) return null;

  const stepsResult = await query(
    `SELECT step_name, step_order, status, assigned_to, acted_by, acted_at, comments
     FROM approval_steps
     WHERE submission_id = $1
     ORDER BY step_order`,
    [id]
  );

  return {
    ...subResult.rows[0],
    approval_steps: stepsResult.rows,
  };
}

/**
 * Complete an approval step
 */
export async function completeApprovalStep(
  submissionId: string,
  stepName: string,
  action: 'approve' | 'reject',
  actedBy: string,
  comments?: string
): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    // Update approval step
    await client.query(
      `UPDATE approval_steps
       SET status = $1, acted_by = $2, acted_at = NOW(), comments = $3
       WHERE submission_id = $4 AND step_name = $5`,
      [action === 'approve' ? 'approved' : 'rejected', actedBy, comments, submissionId, stepName]
    );

    // Update submission status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await client.query(
      `UPDATE submissions
       SET workflow_status = $1, current_step = NULL, completed_at = NOW()
       WHERE id = $2`,
      [newStatus, submissionId]
    );

    await client.query('COMMIT');

    logger.info(`Submission ${submissionId} step ${stepName} ${action}ed by ${actedBy}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function indexSubmission(submission: Submission, formId: string): Promise<void> {
  try {
    const form = await getFormById(formId);
    if (!form) return;
    const client = getOpenSearchClient();
    const dataText = Object.values(submission.data).filter(v => typeof v === 'string' || typeof v === 'number').join(' ');
    await client.index({
      index: SUBMISSIONS_INDEX,
      id: submission.id,
      body: { formId: form.id, formSlug: form.slug, formName: form.name, data: submission.data, dataText, submittedBy: submission.submittedBy, submittedAt: submission.submittedAt.toISOString() },
      refresh: true
    });
  } catch (error) {
    logger.error('Failed to index submission:', error);
  }
}

function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    formId: row.form_id,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
    files: typeof row.files === 'string' ? JSON.parse(row.files) : row.files,
    submittedBy: row.submitted_by,
    submittedAt: new Date(row.submitted_at || row.created_at)
  };
}
