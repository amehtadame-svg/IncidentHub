import type { IncidentStatus } from "../models/incident.model";

/**
 * Transiciones de estado permitidas (Reto 5):
 *   OPEN -> IN_PROGRESS -> RESOLVED
 *   OPEN -> RESOLVED
 * RESOLVED es terminal: no puede volver a OPEN ni a IN_PROGRESS.
 */
const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

/** Type guard: ¿el valor es un estado válido? */
export const isIncidentStatus = (value: unknown): value is IncidentStatus =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(VALID_STATUS_TRANSITIONS, value);

/** ¿Se permite pasar de `current` a `next`? */
export const isValidStatusTransition = (current: unknown, next: unknown): boolean => {
  if (!isIncidentStatus(current) || !isIncidentStatus(next)) return false;
  return VALID_STATUS_TRANSITIONS[current].includes(next);
};

/** Alias para no romper código de P2 que ya usa este nombre. */
export const canTransitionIncidentStatus = (
  currentStatus: unknown,
  nextStatus: unknown,
): nextStatus is IncidentStatus => isValidStatusTransition(currentStatus, nextStatus);