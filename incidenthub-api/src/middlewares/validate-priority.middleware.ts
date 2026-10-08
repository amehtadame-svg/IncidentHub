import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { IncidentPriority } from "../models/incident.model";

const VALID_PRIORITIES: IncidentPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export function validatePriority(
  req: Request,
  res: Response,
  next: NextFunction
): void {
   const { priority } = req.body ?? {};

  if (!VALID_PRIORITIES.includes(priority)) {
    throw new AppError(
      400,
      `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}`
    );
  }

  next();
}