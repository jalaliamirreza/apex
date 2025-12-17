import { Router, Response } from 'express';
import { AuthRequest, internalAuthMiddleware } from '../middleware/auth.middleware';
import * as searchService from '../services/search.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) { res.status(400).json({ error: 'Query parameter q is required' }); return; }
    const results = await searchService.searchSubmissions({
      query,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0
    });
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { query, formSlug, limit, offset } = req.body;
    if (!query) { res.status(400).json({ error: 'Query is required' }); return; }
    const results = await searchService.searchSubmissions({ query, formSlug, limit: limit || 20, offset: offset || 0 });
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
