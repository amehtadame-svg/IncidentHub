import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

/**
 * Enriquece el objeto request (Persona 3 - Infraestructura, 5 pts con logger).
 *
 * Adjunta metadatos que el resto de middlewares y controllers consumen:
 *   - req.requestId: UUID unico por peticion (trazabilidad en logs)
 *   - req.startTime: timestamp de inicio (para medir duracion)
 *
 * Los campos estan tipados en src/types/express.d.ts.
 *
 * Debe montarse ANTES que loggerMiddleware (para que el log incluya el
 * requestId) y ANTES que authMiddleware (correlacion en logs de errores).
 */
export const requestInfoMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  req.requestId = randomUUID();
  req.startTime = Date.now();
  next();
};
