import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function validateId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Fix de integración: en @types/express 5, req.params puede tipar string | string[]
  const id = req.params.id as string;

  // Solo acepta dígitos (rechaza letras, negativos y decimales)
  const isOnlyDigits = /^\d+$/.test(id);

  if (!isOnlyDigits) {
    throw new AppError(400, "Invalid incident id");
  }

  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError(400, "Invalid incident id");
  }

  next();
}