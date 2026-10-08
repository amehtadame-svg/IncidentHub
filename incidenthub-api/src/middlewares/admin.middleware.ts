import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Autorización admin: debe montarse DESPUÉS de authMiddleware.
 *   - 401 si no hay usuario autenticado
 *   - 403 si el usuario no es administrador (technician-token en DELETE)
 */
export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  if (req.user.role !== "admin") {
    next(new AppError(403, "Forbidden: administrator permissions required"));
    return;
  }

  next();
};