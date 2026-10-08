import { NextFunction, Request, Response } from "express";

/**
 * Logger: registra cada petición con el formato del enunciado:
 *   [2026-09-18T15:20:30.000Z] POST /api/incidents
 */
export const loggerMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};