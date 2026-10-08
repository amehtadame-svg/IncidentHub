import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function validateId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.params;

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