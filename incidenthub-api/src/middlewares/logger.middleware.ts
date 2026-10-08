import type { RequestHandler } from 'express';

export const loggerMiddleware: RequestHandler = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl.split('?')[0] || req.path;

  res.once('finish', () => {
    console.info(`[${timestamp}] ${method} ${path} ${res.statusCode}`);
  });

  next();
};