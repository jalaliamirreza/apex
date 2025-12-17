import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as formService from '../services/form.service';
import * as submissionService from '../services/submission.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/:slug/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const { data, files } = req.body;
    if (!data || typeof data !== 'object') { res.status(400).json({ error: 'Data is required' }); return; }
    const submission = await submissionService.createSubmission(form.id, { data, files }, req.user?.preferred_username);
    res.status(201).json(submission);
  } catch (error) {
    logger.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

router.get('/:slug/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await submissionService.getSubmissionsByFormId(form.id, limit, offset);
    res.json(result);
  } catch (error) {
    logger.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

export default router;
