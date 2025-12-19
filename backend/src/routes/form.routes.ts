import { Router, Response } from 'express';
import { AuthRequest, internalAuthMiddleware } from '../middleware/auth.middleware';
import * as formService from '../services/form.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, fields } = req.body;
    if (!name || !fields || !Array.isArray(fields)) {
      res.status(400).json({ error: 'Name and fields are required' });
      return;
    }
    const form = await formService.createForm({ name, description, fields }, req.user?.preferred_username);
    res.status(201).json({ ...form, url: `/forms/${form.slug}` });
  } catch (error: any) {
    logger.error('Create form error:', error);
    if (error.code === '23505') { res.status(409).json({ error: 'Form already exists' }); return; }
    res.status(500).json({ error: 'Failed to create form' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const forms = await formService.listForms();
    res.json({ forms });
  } catch (error) {
    logger.error('List forms error:', error);
    res.status(500).json({ error: 'Failed to list forms' });
  }
});

router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json(form);
  } catch (error) {
    logger.error('Get form error:', error);
    res.status(500).json({ error: 'Failed to get form' });
  }
});

router.delete('/:slug', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const success = await formService.archiveForm(req.params.slug);
    if (!success) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json({ message: 'Form archived' });
  } catch (error) {
    logger.error('Archive form error:', error);
    res.status(500).json({ error: 'Failed to archive form' });
  }
});

export default router;
