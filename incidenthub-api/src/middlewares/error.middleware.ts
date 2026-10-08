import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Middleware centralizado de errores (Persona 3 - Infraestructura, 8 pts con AppError).
 *
 * Debe registrarse SIEMPRE al final de app.ts, DESPUES de todas las rutas y
 * del notFoundMiddleware:
 *   app.use(notFoundMiddleware);
 *   app.use(errorMiddleware); // <- ultimo
 *
 * Comportamiento:
 *   - AppError (operacional): responde con su statusCode y mensaje
 *   - Cualquier otro Error: loguea el stack y responde 500 generico
 *     (nunca se filtran detalles internos al cliente)
 *
 * Contrato de respuesta de error (para frontend/P4):
 *   { "status": "error", "message": "<mensaje>" }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    // eslint-disable-next-line no-console
    console.error(`[AppError] ${req.method} ${req.originalUrl} -> ${err.statusCode} | ${err.message}`);
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Error inesperado (bug): no exponer detalles internos al cliente
  // eslint-disable-next-line no-console
  console.error(`[Error interno] ${req.method} ${req.originalUrl} | ${err.stack ?? err.message}`);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
