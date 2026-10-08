import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Middleware 404 global (Persona 3 - Infraestructura, 4 pts).
 *
 * Captura cualquier peticion que no haya coincidido con ninguna ruta
 * registrada y la delega al errorMiddleware como AppError 404, para que la
 * respuesta tenga el formato de error consistente del contrato:
 *   { "status": "error", "message": "Ruta no encontrada: GET /api/xxx" }
 *
 * Debe montarse DESPUES de todas las rutas y ANTES de errorMiddleware:
 *   app.use("/api/incidents", incidentRoutes);
 *   app.use(notFoundMiddleware);
 *   app.use(errorMiddleware);
 */
export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
