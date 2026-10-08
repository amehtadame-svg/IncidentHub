import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Middleware centralizado de errores. Se registra SIEMPRE al final de app.ts.
 *   - AppError           -> su statusCode y mensaje
 *   - JSON malformado    -> 400 (error de express.json())
 *   - cualquier otro     -> 500 genérico (no se exponen detalles internos)
 * Formato uniforme: { "ok": false, "message": "..." }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ ok: false, message: err.message });
    return;
  }

  const parseError = err as Error & { type?: string; status?: number };
  if (parseError.type === "entity.parse.failed" || parseError.type === "entity.too.large") {
    res.status(parseError.status ?? 400).json({ ok: false, message: "Invalid JSON body" });
    return;
  }

  console.error(`[Internal error] ${req.method} ${req.originalUrl} | ${err.stack ?? err.message}`);
  res.status(500).json({ ok: false, message: "Internal server error" });
};