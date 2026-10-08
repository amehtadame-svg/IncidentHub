import { IncidentStatus } from "../models/incident.model";

/**
 * Reto 5 — Transiciones de estado válidas (lógica REUTILIZABLE para PATCH /:id/status).
 *
 * Creada por Persona 4 como utilidad compartida; Persona 2 puede moverla a su
 * propio middleware cuando entregue (la rúbrica de P2 pide esta lógica reutilizable).
 *
 * Flujo de vida del incidente:  OPEN -> IN_PROGRESS -> RESOLVED
 *
 * Reglas documentadas:
 *   - OPEN        -> IN_PROGRESS | RESOLVED   (se puede atender o resolver directo)
 *   - IN_PROGRESS -> RESOLVED                  (solo hacia adelante)
 *   - RESOLVED    -> (ninguna)                 (estado terminal; el modelo no define CLOSED)
 *   - No se permite permanecer en el mismo estado ni retroceder (ej. IN_PROGRESS -> OPEN)
 */
export const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

export const isValidStatusTransition = (from: IncidentStatus, to: IncidentStatus): boolean =>
  ALLOWED_TRANSITIONS[from].includes(to);

/** Type guard: ¿el valor recibido es un IncidentStatus válido? */
export const isIncidentStatus = (value: unknown): value is IncidentStatus =>
  value === "OPEN" || value === "IN_PROGRESS" || value === "RESOLVED";
