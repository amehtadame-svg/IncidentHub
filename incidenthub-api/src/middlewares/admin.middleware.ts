import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') {
    next(new AppError(403, 'Forbidden'));
    return;
  }

  next();
};