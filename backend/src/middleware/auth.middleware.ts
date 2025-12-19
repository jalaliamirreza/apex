import { Request, Response, NextFunction } from 'express';

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
