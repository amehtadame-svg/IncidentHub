import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Autorizacion admin (Persona 3 - Infraestructura, 5 pts).
 *
 * Bloquea operaciones reservadas a administradores (ej. DELETE /incidents/:id)
 * para cualquier usuario autenticado que no tenga rol "admin".
 *
 * Reglas:
 *   - 401 si no hay req.user (debe montarse DESPUES de authMiddleware)
 *   - 403 si el usuario existe pero su rol no es "admin"
 *
 * Uso en rutas (Persona 4):
 *   router.delete("/:id", authMiddleware, adminMiddleware, controller.delete);
 */
export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError(401, "Autenticacion requerida antes de verificar rol admin"));
    return;
  }

  if (req.user.role !== "admin") {
    next(
      new AppError(
        403,
        `Acceso denegado: el rol '${req.user.role}' no puede realizar esta operacion (se requiere 'admin')`,
      ),
    );
    return;
  }

  next();
};
