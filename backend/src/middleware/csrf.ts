import type { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import { env } from '../config/env';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  },
});

export function csrfErrorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }
  // Pass error to default error handler
  return next(err);
}

export default csrfProtection;
