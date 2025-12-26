import { Router, Request, Response } from 'express';
import { zeebeService } from '../services/zeebe.service';
import {
  updateFormWorkflow,
  getAllFormsWithWorkflow
} from '../services/form.service';
import {
  getSubmissionById,
  completeApprovalStep
} from '../services/submission.service';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/workflow/health
 * Check Zeebe connection status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthy = await zeebeService.healthCheck();
    res.json({
      status: healthy ? 'connected' : 'disconnected',
      gateway: process.env.ZEEBE_ADDRESS || 'localhost:26500',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: String(error) });
  }
});

/**
 * GET /api/v1/workflow/forms
 * Get all forms with their workflow configuration
 */
router.get('/forms', async (req: Request, res: Response) => {
  try {
    const forms = await getAllFormsWithWorkflow();
    res.json({ forms });
  } catch (error) {
    logger.error('Failed to get forms with workflow:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

/**
 * PUT /api/v1/workflow/forms/:id
 * Update workflow settings for a form
 */
router.put('/forms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workflow_enabled, workflow_process_id } = req.body;

    await updateFormWorkflow(
      id,
      workflow_enabled === true,
      workflow_process_id || null
    );

    res.json({
      success: true,
      message: 'Workflow settings updated',
    });
  } catch (error) {
    logger.error('Failed to update form workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow settings' });
  }
});

/**
 * GET /api/v1/workflow/my-tasks
 * Get pending tasks assigned to current user
 */
router.get('/my-tasks', async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userRoles = req.user?.roles || [];
    
    // Build WHERE clause based on user
    // - Directors see all tasks
    // - Managers see tasks assigned to them
    // - Others see nothing (or tasks assigned to them specifically)
    let whereClause = `a.status = 'pending'`;
    const params: string[] = [];
    
    if (userRoles.includes('director')) {
      // Director sees all pending tasks
      // No additional filter
    } else if (userEmail) {
      // User sees only tasks assigned to them
      whereClause += ` AND a.assigned_to = $1`;
      params.push(userEmail);
    } else {
      // Anonymous - no tasks
      return res.json({ tasks: [] });
    }

    const result = await query(
      `SELECT
        s.id as submission_id,
        f.name as form_name,
        f.name_fa as form_name_fa,
        f.slug as form_slug,
        a.id as step_id,
        a.step_name,
        a.assigned_to,
        s.submitted_by,
        s.submitted_at,
        s.data
       FROM approval_steps a
       JOIN submissions s ON a.submission_id = s.id
       JOIN forms f ON s.form_id = f.id
       WHERE ${whereClause}
       ORDER BY s.submitted_at DESC`,
      params
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    logger.error('Failed to get tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

/**
 * GET /api/v1/workflow/my-submissions
 * Get submissions created by current user (outbox)
 */
router.get('/my-submissions', async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.json({ submissions: [] });
    }

    const result = await query(
      `SELECT
        s.id,
        s.form_id,
        f.name as form_name,
        f.name_fa as form_name_fa,
        f.slug as form_slug,
        s.data,
        s.submitted_by,
        s.submitted_at,
        s.workflow_status,
        s.current_step,
        a.assigned_to,
        a.status as step_status,
        a.acted_by,
        a.acted_at,
        a.comments as step_comments
       FROM submissions s
       JOIN forms f ON s.form_id = f.id
       LEFT JOIN approval_steps a ON s.id = a.submission_id
       WHERE s.submitted_by = $1
       ORDER BY s.submitted_at DESC`,
      [userEmail]
    );

    res.json({ submissions: result.rows });
  } catch (error) {
    logger.error('Failed to get my submissions:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

/**
 * GET /api/v1/workflow/my-history
 * Get completed tasks (tasks acted upon by current user)
 */
router.get('/my-history', async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.json({ tasks: [] });
    }

    const result = await query(
      `SELECT
        s.id as submission_id,
        f.name as form_name,
        f.name_fa as form_name_fa,
        s.submitted_by,
        s.submitted_at,
        a.step_name,
        a.status,
        a.acted_at,
        a.comments
       FROM approval_steps a
       JOIN submissions s ON a.submission_id = s.id
       JOIN forms f ON s.form_id = f.id
       WHERE a.acted_by = $1 AND a.status IN ('approved', 'rejected')
       ORDER BY a.acted_at DESC`,
      [userEmail]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    logger.error('Failed to get history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

/**
 * GET /api/v1/workflow/submissions/:id
 * Get submission with full details for workflow view
 */
router.get('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    logger.error('Failed to get submission:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

/**
 * POST /api/v1/workflow/submissions/:id/steps/:stepName/complete
 * Complete an approval step
 */
router.post('/submissions/:id/steps/:stepName/complete', async (req: Request, res: Response) => {
  try {
    const { id, stepName } = req.params;
    const { action, comments } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    // Use authenticated user from mock auth middleware
    const actedBy = req.user?.email || 'anonymous';

    await completeApprovalStep(id, stepName, action, actedBy, comments);

    // TODO: Complete Zeebe job to sync with Camunda
    // Currently only PostgreSQL is updated. Zeebe process instance remains active.
    // Need to implement: store jobKey in approval_steps, then call zeebeService.completeJob()

    const actionPastTense = action === 'approve' ? 'approved' : 'rejected';
    res.json({
      success: true,
      message: `Step ${stepName} ${actionPastTense}`,
    });
  } catch (error) {
    logger.error('Failed to complete step:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

export default router;
