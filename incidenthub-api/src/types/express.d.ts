import "express";

/**
 * Contrato de enriquecimiento del objeto Request (Persona 3 - Infraestructura).
 *
 * request-info.middleware.ts adjunta requestId/startTime y
 * auth.middleware.ts adjunta el usuario autenticado. Persona 4 (controllers)
 * puede apoyarse en estos campos ya tipados.
 */
export interface AuthUser {
  id: string;
  username: string;
  role: "admin" | "tecnico";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** UUID generado por request-info.middleware.ts (trazabilidad en logs) */
      requestId?: string;
      /** Timestamp (ms) de inicio de la peticion, para medir duracion */
      startTime?: number;
      /** Usuario autenticado, adjuntado por auth.middleware.ts */
      user?: AuthUser;
    }
  }
}
