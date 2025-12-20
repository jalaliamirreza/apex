import { Router, Request, Response } from 'express';
import * as launchpadService from '../services/launchpad.service';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/v1/launchpad/spaces - Get all spaces with pages
router.get('/spaces', async (req: Request, res: Response) => {
  try {
    const spaces = await launchpadService.getSpaces();
    res.json({ spaces });
  } catch (error) {
    logger.error('Get spaces error:', error);
    res.status(500).json({ error: 'Failed to get spaces' });
  }
});

// GET /api/v1/launchpad/pages/:pageId - Get page content
router.get('/pages/:pageId', async (req: Request, res: Response) => {
  try {
    const page = await launchpadService.getPageContent(req.params.pageId);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(page);
  } catch (error) {
    logger.error('Get page content error:', error);
    res.status(500).json({ error: 'Failed to get page content' });
  }
});

// GET /api/v1/launchpad/spaces/:spaceId/default-page - Get default page ID
router.get('/spaces/:spaceId/default-page', async (req: Request, res: Response) => {
  try {
    const pageId = await launchpadService.getDefaultPage(req.params.spaceId);
    if (!pageId) {
      res.status(404).json({ error: 'No default page found' });
      return;
    }
    res.json({ pageId });
  } catch (error) {
    logger.error('Get default page error:', error);
    res.status(500).json({ error: 'Failed to get default page' });
  }
});

// GET /api/v1/launchpad/spaces/by-slug/:slug - Get space by slug
router.get('/spaces/by-slug/:slug', async (req: Request, res: Response) => {
  try {
    const space = await launchpadService.getSpaceBySlug(req.params.slug);
    if (!space) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }
    res.json(space);
  } catch (error) {
    logger.error('Get space by slug error:', error);
    res.status(500).json({ error: 'Failed to get space' });
  }
});

// GET /api/v1/launchpad/pages/by-slug/:spaceSlug/:pageSlug - Get page by slugs
router.get('/pages/by-slug/:spaceSlug/:pageSlug', async (req: Request, res: Response) => {
  try {
    const page = await launchpadService.getPageBySlug(req.params.spaceSlug, req.params.pageSlug);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(page);
  } catch (error) {
    logger.error('Get page by slug error:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

// GET /api/v1/launchpad/pages/by-slug/:spaceSlug/:pageSlug/content - Get page content by slugs
router.get('/pages/by-slug/:spaceSlug/:pageSlug/content', async (req: Request, res: Response) => {
  try {
    const page = await launchpadService.getPageBySlug(req.params.spaceSlug, req.params.pageSlug);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const content = await launchpadService.getPageContent(page.id);
    res.json(content);
  } catch (error) {
    logger.error('Get page content by slug error:', error);
    res.status(500).json({ error: 'Failed to get page content' });
  }
});

// GET /api/v1/launchpad/spaces/:slug/default-page-slug - Get default page slug for space
router.get('/spaces/:slug/default-page-slug', async (req: Request, res: Response) => {
  try {
    const pageSlug = await launchpadService.getDefaultPageSlug(req.params.slug);
    if (!pageSlug) {
      res.status(404).json({ error: 'No default page found' });
      return;
    }
    res.json({ slug: pageSlug });
  } catch (error) {
    logger.error('Get default page slug error:', error);
    res.status(500).json({ error: 'Failed to get default page slug' });
  }
});

export default router;
