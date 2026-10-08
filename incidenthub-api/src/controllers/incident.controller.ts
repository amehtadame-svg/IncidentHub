import type { Request, RequestHandler, Response } from "express";
import { incidents } from "../data/incidents.data";
import { CreateIncidentDto } from "../dtos/incident.dto";
import { Incident, IncidentPriority, IncidentStatus } from "../models/incident.model";
import { AppError } from "../errors/app-error";
import { canTransitionIncidentStatus } from "../utils/incident-status-transitions";

/**
 * Lógica de negocio de cada endpoint (Persona 4 - 35 pts).
 *
 * Consume: Model/DTO/Data de P1, AppError de P3, validaciones de P2 y la
 * lógica reutilizable de transiciones de estado de P2 (Reto 5). Los datos
 * viven en memoria (array semilla de P1).
 *
 * Contratos de respuesta:
 *   - Éxito: 200 (GET/PUT/PATCH), 201 (POST), 204 sin body (DELETE)
 *   - Error: AppError -> errorMiddleware -> { "status": "error", "message": ... }
 *   - Los controllers reciben el id ya normalizado en res.locals.incidentId
 *     (lo setea validateId de P2).
 */

const findIndexById = (id: number): number => incidents.findIndex((i) => i.id === id);

const nextId = (): number => incidents.reduce((max, i) => Math.max(max, i.id), 0) + 1;

/** Orden de severidad para el sort por prioridad */
const PRIORITY_ORDER: Record<IncidentPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

/** Type guard local para validar el campo 'status' en PUT (P4). */
const isIncidentStatus = (value: unknown): value is IncidentStatus =>
  value === "OPEN" || value === "IN_PROGRESS" || value === "RESOLVED";

// ── GET /api/incidents ──────────────────────────────────────────────────────
// Query params opcionales (Persona 4 - consultas):
//   ?status=OPEN|IN_PROGRESS|RESOLVED   → filtra por estado
//   ?priority=LOW|MEDIUM|HIGH|CRITICAL  → filtra por prioridad (case-insensitive)
//   ?sort=estimatedMinutes|priority|createdAt&order=asc|desc → ordena
// Valores inválidos responden 400 (AppError). Sin query params, lista todo.
export const getAll = (req: Request, res: Response): void => {
  const statusParam = req.query.status as string | undefined;
  const priorityParam = req.query.priority as string | undefined;
  const sortParam = req.query.sort as string | undefined;
  const orderParam = req.query.order as string | undefined;

  let result = [...incidents];

  if (statusParam !== undefined) {
    if (!isIncidentStatus(statusParam)) {
      throw new AppError(400, `Filtro 'status' inválido: '${statusParam}'. Valores: OPEN, IN_PROGRESS, RESOLVED`);
    }
    result = result.filter((i) => i.status === statusParam);
  }

  if (priorityParam !== undefined) {
    const p = priorityParam.toUpperCase();
    if (!Object.keys(PRIORITY_ORDER).includes(p)) {
      throw new AppError(400, `Filtro 'priority' inválido: '${priorityParam}'. Valores: LOW, MEDIUM, HIGH, CRITICAL`);
    }
    result = result.filter((i) => i.priority === p);
  }

  if (orderParam !== undefined && orderParam !== "asc" && orderParam !== "desc") {
    throw new AppError(400, `Parámetro 'order' inválido: '${orderParam}'. Valores: asc, desc`);
  }
  const dir = orderParam ?? "asc";

  if (sortParam !== undefined) {
    if (sortParam === "estimatedMinutes") {
      result.sort((a, b) => (dir === "desc" ? b.estimatedMinutes - a.estimatedMinutes : a.estimatedMinutes - b.estimatedMinutes));
    } else if (sortParam === "priority") {
      result.sort((a, b) => (dir === "desc" ? PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority] : PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]));
    } else if (sortParam === "createdAt") {
      result.sort((a, b) => (dir === "desc" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
    } else {
      throw new AppError(400, `Parámetro 'sort' inválido: '${sortParam}'. Valores: estimatedMinutes, priority, createdAt`);
    }
  }

  res.status(200).json(result);
};

// ── Reto 1: GET /api/incidents/critical ─────────────────────────────────────
// Incidentes con prioridad CRITICAL (sin importar su estado).
export const getCritical = (_req: Request, res: Response): void => {
  res.status(200).json(incidents.filter((i) => i.priority === "CRITICAL"));
};

// ── Reto 2: GET /api/incidents/pending ──────────────────────────────────────
// Incidentes pendientes, es decir, con estado OPEN.
export const getPending = (_req: Request, res: Response): void => {
  res.status(200).json(incidents.filter((i) => i.status === "OPEN"));
};

// ── Reto 3: GET /api/incidents/stats ────────────────────────────────────────
// Cálculo DINÁMICO sobre el array en memoria (nunca valores hardcodeados).
export const getStats = (_req: Request, res: Response): void => {
  const byStatus: Record<IncidentStatus, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  const byPriority: Record<IncidentPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const byReporter: Record<string, number> = {};
  let totalMinutes = 0;
  let oldest: string | null = null;
  let newest: string | null = null;

  for (const inc of incidents) {
    byStatus[inc.status] += 1;
    byPriority[inc.priority] += 1;
    byReporter[inc.reporter] = (byReporter[inc.reporter] ?? 0) + 1;
    totalMinutes += inc.estimatedMinutes;
    if (oldest === null || inc.createdAt < oldest) oldest = inc.createdAt;
    if (newest === null || inc.createdAt > newest) newest = inc.createdAt;
  }

  res.status(200).json({
    total: incidents.length,
    byStatus,
    byPriority,
    byReporter,
    totalEstimatedMinutes: totalMinutes,
    averageEstimatedMinutes:
      incidents.length > 0 ? Math.round((totalMinutes / incidents.length) * 100) / 100 : 0,
    resolvedPercentage: incidents.length > 0 ? Math.round((byStatus.RESOLVED / incidents.length) * 100) : 0,
    criticalPending: incidents.filter((i) => i.priority === "CRITICAL" && i.status !== "RESOLVED").length,
    oldestIncidentAt: oldest,
    newestIncidentAt: newest,
  });
};

// ── GET /api/incidents/:id ──────────────────────────────────────────────────
export const getById = (_req: Request, res: Response): void => {
  const id: number = res.locals.incidentId; // normalizado por validateId (P2)
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  res.status(200).json(incident);
};

// ── POST /api/incidents ─────────────────────────────────────────────────────
// Crea un incidente: id autoincremental, estado inicial OPEN, createdAt ahora.
// Campos extra del body (id, status, createdAt) se ignoran por seguridad.
export const create = (req: Request, res: Response): void => {
  const dto = req.body as CreateIncidentDto;
  const incident: Incident = {
    id: nextId(),
    title: dto.title.trim(),
    description: dto.description.trim(),
    reporter: dto.reporter.trim(),
    location: dto.location.trim(),
    priority: dto.priority,
    status: "OPEN",
    estimatedMinutes: dto.estimatedMinutes,
    createdAt: new Date().toISOString(),
  };
  incidents.push(incident);
  res.status(201).json(incident);
};

// ── PUT /api/incidents/:id ──────────────────────────────────────────────────
// Reemplazo completo de los campos editables; conserva id y createdAt.
// Acoplado a validateIncidentUpdate (P2): "reporter" es OPCIONAL en PUT —
// si no viene, se conserva el actual. Si el body trae 'status' debe ser un
// IncidentStatus válido (400 si no); si no viene, se conserva el actual.
export const update = (req: Request, res: Response): void => {
  const id: number = res.locals.incidentId; // normalizado por validateId (P2)
  const index = findIndexById(id);
  if (index === -1) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  const body = req.body as Partial<CreateIncidentDto>;
  const current = incidents[index];

  let status = current.status;
  if (req.body?.status !== undefined) {
    if (!isIncidentStatus(req.body.status)) {
      throw new AppError(
        400,
        `El campo 'status' debe ser uno de: OPEN, IN_PROGRESS, RESOLVED (recibido: ${JSON.stringify(req.body.status)})`,
      );
    }
    status = req.body.status;
  }

  incidents[index] = {
    ...current,
    title: body.title!.trim(), // garantizado por validateIncidentUpdate (P2)
    description: body.description!.trim(), // garantizado por validateIncidentUpdate (P2)
    reporter:
      typeof body.reporter === "string" && body.reporter.trim().length > 0
        ? body.reporter.trim()
        : current.reporter, // reporter opcional en PUT: se conserva el actual
    location: body.location!.trim(), // garantizado por validateIncidentUpdate (P2)
    priority: body.priority!, // garantizado por validatePriority (P2)
    estimatedMinutes: body.estimatedMinutes!, // garantizado por validateIncidentUpdate + validateTime (P2)
    status,
  };
  res.status(200).json(incidents[index]);
};

// ── PATCH /api/incidents/:id/status ─────────────────────────────────────────
// Reto 5 — entrega real de P2 (Cristian): transiciones estrictas
// OPEN -> IN_PROGRESS -> RESOLVED (RESOLVED es terminal; no se permite
// OPEN -> RESOLVED directo ni repetir estado). Usa el id normalizado de
// res.locals.incidentId (validateId) y canTransitionIncidentStatus (P2).
// Acoplado al contrato de errores de P3 (AppError).
export const patchIncidentStatus: RequestHandler = (req, res): void => {
  const incidentId: number = res.locals.incidentId;
  const incident = incidents.find((current) => current.id === incidentId);

  if (!incident) {
    throw new AppError(404, `No existe un incidente con ID ${incidentId}.`);
  }

  const requestedStatus: unknown = req.body?.status;
  if (!canTransitionIncidentStatus(incident.status, requestedStatus)) {
    throw new AppError(
      400,
      `No se permite la transición de ${incident.status} a ${String(requestedStatus)}. ` +
        "Transiciones válidas: OPEN->IN_PROGRESS, IN_PROGRESS->RESOLVED",
    );
  }

  incident.status = requestedStatus;
  res.status(200).json(incident);
};

// ── DELETE /api/incidents/:id ───────────────────────────────────────────────
// Solo admin: la ruta aplica authMiddleware + adminMiddleware (Persona 3).
export const remove = (_req: Request, res: Response): void => {
  const id: number = res.locals.incidentId; // normalizado por validateId (P2)
  const index = findIndexById(id);
  if (index === -1) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  incidents.splice(index, 1);
  res.status(204).send();
};
