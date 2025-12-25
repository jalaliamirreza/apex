import { Router, Request, Response } from 'express';
import { MOCK_USERS } from '../data/mockUsers';

const router = Router();

// GET /api/v1/auth/me - Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: req.user });
});

// GET /api/v1/auth/users - List all mock users (dev only)
router.get('/users', (req: Request, res: Response) => {
  // Return users without sensitive data (if any)
  res.json({ users: MOCK_USERS });
});

export default router;
