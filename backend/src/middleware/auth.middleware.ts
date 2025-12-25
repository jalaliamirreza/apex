import { Request, Response, NextFunction } from 'express';
import { getUserByUsername, MockUser } from '../data/mockUsers';

export interface AuthRequest extends Request {
  user?: { sub: string; email: string; preferred_username: string; roles: string[] };
}

export function internalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.APEX_API_KEY) {
    req.user = { sub: 'internal', email: 'system@apex.local', preferred_username: 'system', roles: ['admin'] };
  }
  next();
}

// Extend Express Request type for mock authentication
declare global {
  namespace Express {
    interface Request {
      user?: MockUser | null;
    }
  }
}

export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const mockUsername = req.headers['x-mock-user'] as string;

  if (mockUsername) {
    req.user = getUserByUsername(mockUsername) || null;
  } else {
    req.user = null;
  }

  next();
};

// Optional: Require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Optional: Require specific role
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
