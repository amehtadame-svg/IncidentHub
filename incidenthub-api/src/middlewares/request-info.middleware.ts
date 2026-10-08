import { NextFunction, Request, Response } from "express";

/**
 * RequestInfo: enriquece el objeto Request con información adicional antes
 * de entregarlo al siguiente componente (ver src/types/express.d.ts).
 */
export const requestInfoMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  req.requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  };
  next();
};