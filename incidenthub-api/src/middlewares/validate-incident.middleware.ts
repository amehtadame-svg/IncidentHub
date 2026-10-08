import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

interface IncidentBody {
  title?: unknown;
  description?: unknown;
  reporter?: unknown;
  location?: unknown;
  priority?: unknown;
  estimatedMinutes?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Validación completa para creación (POST).
 * Requiere todos los campos del CreateIncidentDto.
 */
export function validateIncident(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { title, description, reporter, location, priority, estimatedMinutes } =
    (req.body ?? {}) as IncidentBody;

  const errors: string[] = [];

  if (!isNonEmptyString(title)) {
    errors.push("title is required and must be a non-empty string");
  }
  if (!isNonEmptyString(description)) {
    errors.push("description is required and must be a non-empty string");
  }
  if (!isNonEmptyString(reporter)) {
    errors.push("reporter is required and must be a non-empty string");
  }
  if (!isNonEmptyString(location)) {
    errors.push("location is required and must be a non-empty string");
  }
  if (!isNonEmptyString(priority)) {
    errors.push("priority is required and must be a non-empty string");
  }
  if (estimatedMinutes === undefined || estimatedMinutes === null) {
    errors.push("estimatedMinutes is required");
  } else if (!isValidNumber(estimatedMinutes)) {
    errors.push("estimatedMinutes must be a number");
  }

  if (errors.length > 0) {
    throw new AppError(400, errors.join(" | "));
  }

  next();
}

/**
 * Validación para actualización (PUT).
 * No exige "reporter" (según el ejemplo del enunciado) y
 * bloquea el intento de modificar el id desde el body.
 */
export function validateIncidentUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { title, description, location, priority, estimatedMinutes } =
    (req.body ?? {}) as IncidentBody;

  const errors: string[] = [];

  if (!isNonEmptyString(title)) {
    errors.push("title is required and must be a non-empty string");
  }
  if (!isNonEmptyString(description)) {
    errors.push("description is required and must be a non-empty string");
  }
  if (!isNonEmptyString(location)) {
    errors.push("location is required and must be a non-empty string");
  }
  if (!isNonEmptyString(priority)) {
    errors.push("priority is required and must be a non-empty string");
  }
  if (estimatedMinutes === undefined || estimatedMinutes === null) {
    errors.push("estimatedMinutes is required");
  } else if (!isValidNumber(estimatedMinutes)) {
    errors.push("estimatedMinutes must be a number");
  }

  if ("id" in (req.body ?? {})) {
    errors.push("id cannot be modified");
  }

  if (errors.length > 0) {
    throw new AppError(400, errors.join(" | "));
  }

  next();
}