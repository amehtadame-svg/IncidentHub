import type { RequestHandler } from 'express';

export const requestInfoMiddleware: RequestHandler = (req, _res, next) => {
  req.requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  };

  next();
};