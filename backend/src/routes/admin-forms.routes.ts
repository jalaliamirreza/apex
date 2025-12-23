import { Router } from 'express';
import * as adminFormsService from '../services/admin-forms.service';

const router = Router();

// GET /api/v1/admin/forms - List all forms
router.get('/', async (req, res) => {
  try {
    const forms = await adminFormsService.getAllForms();
    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

// GET /api/v1/admin/forms/:id - Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await adminFormsService.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get form' });
  }
});

// POST /api/v1/admin/forms - Create form
router.post('/', async (req, res) => {
  try {
    const form = await adminFormsService.createForm(req.body);
    res.status(201).json(form);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// PUT /api/v1/admin/forms/:id - Update form
router.put('/:id', async (req, res) => {
  try {
    const form = await adminFormsService.updateForm(req.params.id, req.body);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// DELETE /api/v1/admin/forms/:id - Delete form
router.delete('/:id', async (req, res) => {
  try {
    await adminFormsService.deleteForm(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default router;
