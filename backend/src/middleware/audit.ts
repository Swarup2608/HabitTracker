import type { Request, Response, NextFunction } from 'express';
import { logger, httpLogger } from '../utils/logger';

interface AuditEvent {
  timestamp: string;
  userId: string | null;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent?: string;
  duration: number;
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
               req.ip ||
               'unknown';

    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      userId: req.user?.sub || null,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip,
      userAgent: req.get('user-agent'),
      duration,
    };

    // Log HTTP requests
    httpLogger.http(JSON.stringify(auditEvent));

    // Log sensitive operations (state-changing requests)
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method)) {
      const level = res.statusCode >= 400 ? 'warn' : 'info';
      logger[level as keyof typeof logger](
        `${req.method} ${req.path} - Status: ${res.statusCode} - User: ${auditEvent.userId} - IP: ${ip} - Duration: ${duration}ms`
      );
    }

    // Log errors
    if (res.statusCode >= 500) {
      logger.error(`Server error on ${req.method} ${req.path} - Status: ${res.statusCode}`);
    }

    // Log unauthorized/forbidden attempts
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn(`${res.statusCode} - ${req.method} ${req.path} - IP: ${ip}`);
    }

    // Log rate limit breaches
    if (res.statusCode === 429) {
      logger.warn(`Rate limit exceeded - ${req.method} ${req.path} - IP: ${ip}`);
    }

    return originalSend.call(this, data);
  };

  next();
}
