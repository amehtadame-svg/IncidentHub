import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { IncidentPriority } from "../models/incident.model";

/**
 * STUB funcional creado por Persona 4 para avanzar en paralelo (P2 aún no
 * entrega). Persona 2 (Cristian) debe consolidar este middleware.
 *
 * Valida que body.priority sea una prioridad permitida por el modelo de P1:
 * LOW | MEDIUM | HIGH | CRITICAL.
 */
const ALLOWED_PRIORITIES: IncidentPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const validatePriorityMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body ?? {};

  if (!ALLOWED_PRIORITIES.includes(body.priority)) {
    next(
      new AppError(
        400,
        `Prioridad inválida: '${body.priority}'. Permitidas: ${ALLOWED_PRIORITIES.join(", ")}`,
      ),
    );
    return;
  }

  next();
};
