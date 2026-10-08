import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * STUB funcional creado por Persona 4 para avanzar en paralelo (P2 aún no
 * entrega). Persona 2 (Cristian) debe consolidar este middleware.
 *
 * Valida los campos obligatorios del incidente (CreateIncidentDto de P1):
 * title, description, reporter, location (strings no vacíos) y estimatedMinutes
 * (número presente; el rango >0 y <=480 se valida en validate-time).
 */
const REQUIRED_STRING_FIELDS = ["title", "description", "reporter", "location"] as const;

export const validateIncidentMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body ?? {};
  const missing: string[] = [];

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof body[field] !== "string" || body[field].trim().length === 0) {
      missing.push(field);
    }
  }

  if (typeof body.estimatedMinutes !== "number" || !Number.isFinite(body.estimatedMinutes)) {
    missing.push("estimatedMinutes (número)");
  }

  if (missing.length > 0) {
    next(new AppError(400, `Campos obligatorios faltantes o inválidos: ${missing.join(", ")}`));
    return;
  }

  next();
};
