import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { AuthUser } from "../types/express";

/**
 * Autenticación por token Bearer (sin JWT, tokens fijos en memoria).
 *   Authorization: Bearer instructor-token   -> administrador
 *   Authorization: Bearer technician-token   -> técnico
 * Sin header, con esquema distinto de Bearer o con token incorrecto: 401.
 */
const VALID_TOKENS: Record<string, AuthUser> = {
  "instructor-token": { id: "u-admin", username: "instructor", role: "admin" },
  "technician-token": { id: "u-tec", username: "technician", role: "tecnico" },
};

const BEARER_PREFIX = "Bearer ";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new AppError(401, "Authentication required: send 'Authorization: Bearer <token>'"));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  const user = Object.prototype.hasOwnProperty.call(VALID_TOKENS, token) ? VALID_TOKENS[token] : undefined;

  if (!user) {
    next(new AppError(401, "Invalid token"));
    return;
  }

  req.user = user;
  next();
};