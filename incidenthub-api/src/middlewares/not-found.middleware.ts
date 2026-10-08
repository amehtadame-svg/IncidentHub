import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/** 404 global: se monta después de las rutas y antes del errorMiddleware. */
export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, "Route not found"));
};