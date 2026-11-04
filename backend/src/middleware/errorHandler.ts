import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/errors';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ status: 404, code: 'NOT_FOUND', message: `No route ${req.method} ${req.path}` });
}

// Four parameters are required for Express to treat this as error middleware.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ status: err.status, code: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  // Never leak internals to the client; log the real cause server-side.
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 500,
    code: 'INTERNAL_ERROR',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
  });
}
