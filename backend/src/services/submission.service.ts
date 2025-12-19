import { query } from '../config/database';
import { Submission, CreateSubmissionInput } from '../models/submission.model';
import { getOpenSearchClient, SUBMISSIONS_INDEX } from '../config/opensearch';
import { getFormById } from './form.service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export async function createSubmission(formId: string, input: CreateSubmissionInput, submittedBy?: string): Promise<Submission> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO submissions (id, form_id, data, files, submitted_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, formId, JSON.stringify(input.data), JSON.stringify(input.files || []), submittedBy]
  );
  const submission = mapRowToSubmission(result.rows[0]);
  await indexSubmission(submission, formId);
  return submission;
}

export async function getSubmissionsByFormId(formId: string, limit = 50, offset = 0): Promise<{ submissions: Submission[]; total: number }> {
  const countResult = await query('SELECT COUNT(*) FROM submissions WHERE form_id = $1', [formId]);
  const total = parseInt(countResult.rows[0].count);
  const result = await query(
    `SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC LIMIT $2 OFFSET $3`,
    [formId, limit, offset]
  );
  return { submissions: result.rows.map(mapRowToSubmission), total };
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
    submittedAt: new Date(row.submitted_at)
  };
}
