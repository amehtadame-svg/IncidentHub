import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * STUB funcional creado por Persona 4 para avanzar en paralelo (P2 aún no
 * entrega). Persona 2 (Cristian) debe consolidar este middleware.
 *
 * Valida el tiempo estimado (estimatedMinutes):
 *   - Regla base: debe ser > 0 y <= 480 minutos.
 *   - Reto 4 (CRITICAL <= 60 min): un incidente CRITICAL no puede estimar más
 *     de 60 minutos.
 *
 * ¿Por qué el Reto 4 vive AQUÍ? Es una regla de negocio sobre el campo
 * estimatedMinutes: al vivir en el mismo middleware que valida el rango del
 * tiempo estimado, todas las reglas de tiempo quedan en un solo lugar
 * (cohesión) y se aplican igual en POST y PUT sin duplicar lógica.
 */
const MAX_MINUTES = 480;
const MAX_CRITICAL_MINUTES = 60;

export const validateTimeMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body ?? {};
  const minutes = body.estimatedMinutes;

  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0 || minutes > MAX_MINUTES) {
    next(new AppError(400, `estimatedMinutes debe ser > 0 y <= ${MAX_MINUTES} (recibido: ${minutes})`));
    return;
  }

  if (body.priority === "CRITICAL" && minutes > MAX_CRITICAL_MINUTES) {
    next(
      new AppError(
        400,
        `Reto 4: un incidente CRITICAL no puede estimar más de ${MAX_CRITICAL_MINUTES} minutos (recibido: ${minutes})`,
      ),
    );
    return;
  }

  next();
};
