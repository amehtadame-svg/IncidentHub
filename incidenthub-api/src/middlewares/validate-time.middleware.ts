import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

const MAX_ESTIMATED_MINUTES = 480;
const MAX_CRITICAL_MINUTES = 60;

/**
 * Valida estimatedMinutes cuando viene en el cuerpo de la petición.
 * Si se omite, la validación de campos obligatorios la cubrirá en POST/PUT;
 * permitir omitirlo aquí también hace posible usar este middleware en PATCH.
 */
export const validateTime = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const estimatedMinutes: unknown = req.body?.estimatedMinutes;

  if (estimatedMinutes === undefined) {
    next();
    return;
  }

  if (
    typeof estimatedMinutes !== "number" ||
    !Number.isFinite(estimatedMinutes) ||
    estimatedMinutes <= 0 ||
    estimatedMinutes > MAX_ESTIMATED_MINUTES
  ) {
    next(
      new AppError(
        400,
        `estimatedMinutes debe ser un número mayor que 0 y menor o igual a ${MAX_ESTIMATED_MINUTES}.`,
      ),
    );
    return;
  }

  // Regla de negocio cruzada: CRITICAL restringe el tiempo estimado.
  // Se valida aquí porque es una excepción al límite de tiempo general; por eso
  // esta función debe ejecutarse después de validar que la prioridad sea válida.
  // En PATCH, la ruta deberá pasar los valores efectivos (registro actual + cambios).
  if (
    req.body?.priority === "CRITICAL" &&
    estimatedMinutes > MAX_CRITICAL_MINUTES
  ) {
    next(
      new AppError(
        400,
        `Los incidentes CRITICAL deben tener un tiempo estimado menor o igual a ${MAX_CRITICAL_MINUTES} minutos.`,
      ),
    );
    return;
  }

  next();
};
