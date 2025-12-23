import { Router, Request, Response } from 'express';
import * as adminService from '../services/admin.service';

const router = Router();

// ==================== SPACES ====================

router.get('/spaces', async (req: Request, res: Response) => {
  try {
    const spaces = await adminService.getAllSpaces();
    res.json({ spaces });
  } catch (error: any) {
    console.error('Get spaces error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/spaces/:id', async (req: Request, res: Response) => {
  try {
    const space = await adminService.getSpaceById(req.params.id);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }
    res.json(space);
  } catch (error: any) {
    console.error('Get space error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/spaces', async (req: Request, res: Response) => {
  try {
    const space = await adminService.createSpace(req.body);
    res.status(201).json(space);
  } catch (error: any) {
    console.error('Create space error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/spaces/:id', async (req: Request, res: Response) => {
  try {
    const space = await adminService.updateSpace(req.params.id, req.body);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }
    res.json(space);
  } catch (error: any) {
    console.error('Update space error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/spaces/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteSpace(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete space error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PAGES ====================

router.get('/pages', async (req: Request, res: Response) => {
  try {
    const spaceId = req.query.spaceId as string | undefined;
    const pages = await adminService.getAllPages(spaceId);
    res.json({ pages });
  } catch (error: any) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pages/:id', async (req: Request, res: Response) => {
  try {
    const page = await adminService.getPageById(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    console.error('Get page error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/pages', async (req: Request, res: Response) => {
  try {
    const page = await adminService.createPage(req.body);
    res.status(201).json(page);
  } catch (error: any) {
    console.error('Create page error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/pages/:id', async (req: Request, res: Response) => {
  try {
    const page = await adminService.updatePage(req.params.id, req.body);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    console.error('Update page error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pages/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deletePage(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SECTIONS ====================

router.get('/sections', async (req: Request, res: Response) => {
  try {
    const pageId = req.query.pageId as string | undefined;
    const sections = await adminService.getAllSections(pageId);
    res.json({ sections });
  } catch (error: any) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/sections/:id', async (req: Request, res: Response) => {
  try {
    const section = await adminService.getSectionById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error: any) {
    console.error('Get section error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sections', async (req: Request, res: Response) => {
  try {
    const section = await adminService.createSection(req.body);
    res.status(201).json(section);
  } catch (error: any) {
    console.error('Create section error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/sections/:id', async (req: Request, res: Response) => {
  try {
    const section = await adminService.updateSection(req.params.id, req.body);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error: any) {
    console.error('Update section error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/sections/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteSection(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete section error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TILES ====================

router.get('/tiles', async (req: Request, res: Response) => {
  try {
    const sectionId = req.query.sectionId as string | undefined;
    const tiles = await adminService.getAllTiles(sectionId);
    res.json({ tiles });
  } catch (error: any) {
    console.error('Get tiles error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/tiles/:id', async (req: Request, res: Response) => {
  try {
    const tile = await adminService.getTileById(req.params.id);
    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }
    res.json(tile);
  } catch (error: any) {
    console.error('Get tile error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/tiles', async (req: Request, res: Response) => {
  try {
    const tile = await adminService.createTile(req.body);
    res.status(201).json(tile);
  } catch (error: any) {
    console.error('Create tile error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/tiles/:id', async (req: Request, res: Response) => {
  try {
    const tile = await adminService.updateTile(req.params.id, req.body);
    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }
    res.json(tile);
  } catch (error: any) {
    console.error('Update tile error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tiles/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteTile(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete tile error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
