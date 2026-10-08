import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ ok: false, message: error.message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    res.status(400).json({ ok: false, message: 'Invalid JSON body' });
    return;
  }

  console.error(
    `[${req.requestInfo?.timestamp ?? new Date().toISOString()}]`,
    error,
  );
  res.status(500).json({ ok: false, message: 'Internal server error' });
};