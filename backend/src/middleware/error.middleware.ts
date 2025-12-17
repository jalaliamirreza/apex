import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
