import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (err: Error | ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof ApiError ? err.status : 500;
  const payload = {
    error: err.message,
    details: err instanceof ApiError ? err.details : undefined,
  };

  if (status >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err }, 'Handled error');
  }

  res.status(status).json(payload);
};
