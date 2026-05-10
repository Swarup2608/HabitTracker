import type { Request, Response, NextFunction } from 'express';
import { verifyAccess, AccessPayload } from '../services/token.service';
import { ApiError } from '../utils/ApiError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new ApiError(401, 'Unauthorized'));
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
