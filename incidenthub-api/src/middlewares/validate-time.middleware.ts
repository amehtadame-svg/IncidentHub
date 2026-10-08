import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * Validación del tiempo estimado (estimatedMinutes).
 *
 * Implementado durante la integración (la rama ameht/P2 no entregó este
 * archivo; P2 puede consolidar/ajustar). Sigue el estilo y nomenclatura de
 * los demás middlewares de validación de P2 (export function validateTime).
 *
 * Reglas:
 *   - Base: estimatedMinutes debe ser > 0 y <= 480 minutos.
 *   - Reto 4 (CRITICAL <= 60 min): un incidente CRITICAL no puede estimar
 *     más de 60 minutos.
 *
 * ¿Por qué el Reto 4 vive AQUÍ? Es una regla de negocio sobre el campo
 * estimatedMinutes: al vivir en el middleware que valida el rango del tiempo
 * estimado, todas las reglas de tiempo quedan en un solo lugar (cohesión) y
 * se aplican igual en POST y PUT sin duplicar lógica.
 */
const MAX_MINUTES = 480;
const MAX_CRITICAL_MINUTES = 60;

export function validateTime(req: Request, res: Response, next: NextFunction): void {
  const { estimatedMinutes, priority } = req.body ?? {};

  if (
    typeof estimatedMinutes !== "number" ||
    Number.isNaN(estimatedMinutes) ||
    estimatedMinutes <= 0 ||
    estimatedMinutes > MAX_MINUTES
  ) {
    throw new AppError(400, `estimatedMinutes must be > 0 and <= ${MAX_MINUTES} (received: ${estimatedMinutes})`);
  }

  if (priority === "CRITICAL" && estimatedMinutes > MAX_CRITICAL_MINUTES) {
    throw new AppError(
      400,
      `Reto 4: a CRITICAL incident cannot estimate more than ${MAX_CRITICAL_MINUTES} minutes (received: ${estimatedMinutes})`,
    );
  }

  next();
}
