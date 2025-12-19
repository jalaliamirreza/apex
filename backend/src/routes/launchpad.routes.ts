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

export default router;
