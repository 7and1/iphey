import type { Request, Response, NextFunction } from 'express';
import { logger, redactIp } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const forwardedFor = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  const clientIp = redactIp(forwardedFor ?? req.socket.remoteAddress ?? undefined);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl ?? req.url,
        statusCode: res.statusCode,
        duration,
        ip: clientIp,
      },
      'Request completed'
    );
  });

  res.on('error', error => {
    const duration = Date.now() - start;
    logger.error(
      {
        method: req.method,
        url: req.originalUrl ?? req.url,
        duration,
        ip: clientIp,
        err: error,
      },
      'Request failed'
    );
  });

  next();
};
