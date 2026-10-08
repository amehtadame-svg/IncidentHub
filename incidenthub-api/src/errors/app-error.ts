/**
 * Clase de error controlada (Persona 3 - Infraestructura).
 *
 * Todos los errores operacionales de la API (validaciones, auth, 404, reglas
 * de negocio) deben lanzarse como AppError para que el errorMiddleware los
 * traduzca a una respuesta HTTP consistente. Cualquier error que NO sea
 * AppError se trata como 500 interno y nunca se filtran detalles al cliente.
 *
 * Firma definida por P1: new AppError(statusCode, message)
 */
export class AppError extends Error {
  /** true = error esperado/operacional (4xx), los bugs inesperados no usan AppError */
  public readonly isOperational: boolean;

  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.isOperational = true;

    // Mantiene la cadena de prototipos correcta al extender Error en TS
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
