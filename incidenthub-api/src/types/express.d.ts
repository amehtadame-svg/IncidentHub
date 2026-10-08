import "express";

export interface AuthUser {
  id: string;
  username: string;
  role: "admin" | "tecnico";
}

export interface RequestInfo {
  timestamp: string;
  method: string;
  path: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Información de la petición, agregada por request-info.middleware.ts */
      requestInfo?: RequestInfo;
      /** Usuario autenticado, agregado por auth.middleware.ts */
      user?: AuthUser;
    }
  }
}