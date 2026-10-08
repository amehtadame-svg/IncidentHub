import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

const usersByToken: Record<
  string,
  { username: string; role: 'ADMIN' | 'TECHNICIAN' }
> = {
  'instructor-token': { username: 'instructor', role: 'ADMIN' },
  'technician-token': { username: 'technician', role: 'TECHNICIAN' },
};

export const authenticate: RequestHandler = (req, _res, next) => {
  const match = req.get('authorization')?.match(/^Bearer\s+(\S+)$/i);
  const token = match?.[1];
  const user = token ? usersByToken[token] : undefined;

  if (!user) {
    next(new AppError(401, 'Unauthorized'));
    return;
  }

  req.user = user;
  next();
};