import type { IncidentStatus } from "../models/incident.model";

/**
 * Flujo permitido para actualizar el estado de un incidente:
 * OPEN -> IN_PROGRESS -> RESOLVED.
 * RESOLVED es terminal y repetir el mismo estado no cuenta como transición.
 */
const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

const isIncidentStatus = (value: unknown): value is IncidentStatus =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(VALID_STATUS_TRANSITIONS, value);

/**
 * Devuelve si el estado solicitado es una transición permitida desde el estado
 * actual. Acepta unknown para poder validar directamente valores del request.
 */
export const canTransitionIncidentStatus = (
  currentStatus: unknown,
  nextStatus: unknown,
): nextStatus is IncidentStatus => {
  if (!isIncidentStatus(currentStatus) || !isIncidentStatus(nextStatus)) {
    return false;
  }

  return VALID_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
};
