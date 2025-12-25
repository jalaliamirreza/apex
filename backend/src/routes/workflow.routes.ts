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
 * Get pending tasks (for current user/role)
 */
router.get('/my-tasks', async (req: Request, res: Response) => {
  try {
    // For now, return all pending tasks
    // Later: filter by user/role from auth
    const result = await query(
      `SELECT
        s.id as submission_id,
        f.name as form_name,
        f.name_fa as form_name_fa,
        f.slug as form_slug,
        a.step_name,
        a.assigned_to,
        s.submitted_by,
        s.created_at as submitted_at,
        s.data
       FROM approval_steps a
       JOIN submissions s ON a.submission_id = s.id
       JOIN forms f ON s.form_id = f.id
       WHERE a.status = 'pending'
       ORDER BY s.created_at DESC`
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    logger.error('Failed to get tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
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

    // TODO: Get actual user from auth
    const actedBy = req.body.acted_by || 'admin@company.com';

    await completeApprovalStep(id, stepName, action, actedBy, comments);

    res.json({
      success: true,
      message: `Step ${stepName} ${action}ed`,
    });
  } catch (error) {
    logger.error('Failed to complete step:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

export default router;
