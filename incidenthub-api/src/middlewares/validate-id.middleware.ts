import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../errors/app-error";

const POSITIVE_INTEGER_ID = /^[1-9]\d*$/;

/**
 * Valida y normaliza el ID positivo recibido en los parámetros de ruta.
 *
 * Entrega real de P2 (Cristian, rama arena/f03de487). Acoplamiento de la
 * integración: los errores pasan por AppError (contrato de errores de P3) y
 * el id normalizado se guarda en res.locals.incidentId para los controllers.
 */
export const validateId: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const rawId = req.params.id as string;

  if (typeof rawId !== "string" || !POSITIVE_INTEGER_ID.test(rawId)) {
    next(new AppError(400, "El ID debe ser un entero positivo."));
    return;
  }

  const id = Number(rawId);
  if (!Number.isSafeInteger(id)) {
    next(new AppError(400, "El ID debe ser un entero positivo seguro."));
    return;
  }

  // Se guarda el número normalizado para que el controlador no lo convierta otra vez.
  res.locals.incidentId = id;
  next();
};
