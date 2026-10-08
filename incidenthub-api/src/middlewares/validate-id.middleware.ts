import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

const POSITIVE_INTEGER_ID = /^[1-9]\d*$/;

/** El parámetro :id debe ser un entero positivo (inválidos: abc, -3, 4.5). */
export const validateId = (req: Request, _res: Response, next: NextFunction): void => {
  const rawId = req.params.id;

  if (typeof rawId !== "string" || !POSITIVE_INTEGER_ID.test(rawId) || !Number.isSafeInteger(Number(rawId))) {
    next(new AppError(400, "Invalid incident id"));
    return;
  }

  next();
};