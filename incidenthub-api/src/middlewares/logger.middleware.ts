import { NextFunction, Request, Response } from "express";

/**
 * Logger de peticiones (Persona 3 - Infraestructura, 5 pts con request-info).
 *
 * Registra en consola cada peticion con: timestamp, requestId (si request-info
 * ya corrio), metodo, URL, status de respuesta y duracion en ms.
 *
 * Orden recomendado en app.ts:
 *   app.use(requestInfoMiddleware); // primero, para tener requestId
 *   app.use(loggerMiddleware);
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const idTag = req.requestId ? ` [req:${req.requestId.slice(0, 8)}]` : "";
    // eslint-disable-next-line no-console
    console.log(
      `${timestamp}${idTag} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
};
