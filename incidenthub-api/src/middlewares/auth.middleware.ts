import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { AuthUser } from "../types/express";

/**
 * Autenticacion por token Bearer (Persona 3 - Infraestructura, 5 pts).
 *
 * Valida el header `Authorization: Bearer <token>` y, si es valido, adjunta
 * el usuario autenticado a `req.user` (tipado en src/types/express.d.ts).
 *
 * Errores (via AppError -> errorMiddleware):
 *   - 401 si falta el header o no usa el esquema Bearer
 *   - 401 si el token esta vacio, es invalido o expiro
 *
 * Tokens demo en memoria: 1 admin + 1 tecnico (para probar la autorizacion).
 * Para produccion, moverlos a variables de entorno (.env) sin cambiar el contrato.
 */
const VALID_TOKENS: Record<string, AuthUser> = {
  "token-admin-001": { id: "u-admin", username: "ana.admin", role: "admin" },
  "token-tecnico-001": { id: "u-tec", username: "luis.tecnico", role: "tecnico" },
};

const BEARER_PREFIX = "Bearer ";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new AppError(401, 'Autenticacion requerida: envie el header "Authorization: Bearer <token>"'));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    next(new AppError(401, "Autenticacion requerida: el token Bearer esta vacio"));
    return;
  }

  const user = VALID_TOKENS[token];
  if (!user) {
    next(new AppError(401, "Token invalido o expirado"));
    return;
  }

  req.user = user;
  next();
};
