import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * STUB funcional creado por Persona 4 para avanzar en paralelo (P2 aún no
 * entrega). Persona 2 (Cristian) debe consolidar este middleware.
 *
 * Valida que req.params.id sea un número entero positivo.
 * El controller vuelve a parsear el id con Number(req.params.id).
 */
export const validateIdMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const raw = req.params.id;
  const id = Number(raw);

  if (!raw || !Number.isInteger(id) || id <= 0) {
    next(new AppError(400, `El parámetro 'id' debe ser un número entero positivo (recibido: '${raw}')`));
    return;
  }

  next();
};
