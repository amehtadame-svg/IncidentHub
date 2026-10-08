import { Request, Response } from "express";
import { incidents } from "../data/incidents.data";
import { CreateIncidentDto } from "../dtos/incident.dto";
import { Incident, IncidentPriority, IncidentStatus } from "../models/incident.model";
import { AppError } from "../errors/app-error";
import { isIncidentStatus, isValidStatusTransition } from "../utils/incident-status-transitions";

/**
 * Controller de incidentes (Persona 4).
 *
 * Responsabilidad: lógica de cada endpoint sobre el array en memoria.
 * NO valida el body (eso lo hacen los middlewares de P2) y NO arma respuestas
 * de error: lanza AppError y el errorMiddleware (P3) responde.
 *
 * Contrato de éxito:   { ok: true, data }  |  { ok: true, total, data } en listas
 * Contrato de error:   { ok: false, message }  (lo genera el errorMiddleware)
 */

const NOT_FOUND = "Incident not found";

const PRIORITY_ORDER: Record<IncidentPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const findIndexById = (id: number): number => incidents.findIndex((i) => i.id === id);

const findOrFail = (id: number): number => {
  const index = findIndexById(id);
  if (index === -1) throw new AppError(404, NOT_FOUND);
  return index;
};

const nextId = (): number => incidents.reduce((max, i) => Math.max(max, i.id), 0) + 1;

const list = (res: Response, data: Incident[]): void => {
  res.status(200).json({ ok: true, total: data.length, data });
};

// ── GET /api/incidents  (filtros opcionales: ?status ?priority ?sort ?order) ─
export const getAll = (req: Request, res: Response): void => {
  const { status, priority, sort, order } = req.query as Record<string, string | undefined>;
  let result = [...incidents];

  if (status !== undefined) {
    if (!isIncidentStatus(status)) throw new AppError(400, "Invalid status filter. Allowed: OPEN, IN_PROGRESS, RESOLVED");
    result = result.filter((i) => i.status === status);
  }

  if (priority !== undefined) {
    const p = priority.toUpperCase();
    if (!(p in PRIORITY_ORDER)) throw new AppError(400, "Invalid priority filter. Allowed: LOW, MEDIUM, HIGH, CRITICAL");
    result = result.filter((i) => i.priority === p);
  }

  if (order !== undefined && order !== "asc" && order !== "desc") {
    throw new AppError(400, "Invalid order. Allowed: asc, desc");
  }
  const dir = order === "desc" ? -1 : 1;

  if (sort !== undefined) {
    if (sort === "estimatedMinutes") result.sort((a, b) => dir * (a.estimatedMinutes - b.estimatedMinutes));
    else if (sort === "priority") result.sort((a, b) => dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]));
    else if (sort === "createdAt") result.sort((a, b) => dir * a.createdAt.localeCompare(b.createdAt));
    else throw new AppError(400, "Invalid sort. Allowed: estimatedMinutes, priority, createdAt");
  }

  list(res, result);
};

// ── Reto 1: GET /api/incidents/critical ─────────────────────────────────────
export const getCritical = (_req: Request, res: Response): void => {
  list(res, incidents.filter((i) => i.priority === "CRITICAL"));
};

// ── Reto 2: GET /api/incidents/pending  (OPEN o IN_PROGRESS) ────────────────
export const getPending = (_req: Request, res: Response): void => {
  list(res, incidents.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS"));
};

// ── Reto 3: GET /api/incidents/stats  (calculado dinámicamente) ─────────────
export const getStats = (_req: Request, res: Response): void => {
  const total = incidents.length;
  const count = (fn: (i: Incident) => boolean): number => incidents.filter(fn).length;
  const totalMinutes = incidents.reduce((acc, i) => acc + i.estimatedMinutes, 0);

  const byPriority: Record<IncidentPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  incidents.forEach((i) => (byPriority[i.priority] += 1));

  res.status(200).json({
    ok: true,
    data: {
      total,
      open: count((i) => i.status === "OPEN"),
      inProgress: count((i) => i.status === "IN_PROGRESS"),
      resolved: count((i) => i.status === "RESOLVED"),
      critical: byPriority.CRITICAL,
      averageEstimatedMinutes: total > 0 ? Math.round(totalMinutes / total) : 0,
      // Campos adicionales (documentados en el README)
      totalEstimatedMinutes: totalMinutes,
      byPriority,
    },
  });
};

// ── GET /api/incidents/:id ──────────────────────────────────────────────────
export const getById = (req: Request, res: Response): void => {
  const index = findOrFail(Number(req.params.id));
  res.status(200).json({ ok: true, data: incidents[index] });
};

// ── POST /api/incidents ─────────────────────────────────────────────────────
// El cliente solo envía el DTO; id, status y createdAt los genera el servidor.
export const create = (req: Request, res: Response): void => {
  const dto = req.body as CreateIncidentDto;
  const incident: Incident = {
    id: nextId(),
    title: dto.title.trim(),
    description: dto.description.trim(),
    reporter: dto.reporter.trim(),
    location: dto.location.trim(),
    priority: dto.priority,
    estimatedMinutes: dto.estimatedMinutes,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  incidents.push(incident);
  res.status(201).json({ ok: true, data: incident });
};

// ── PUT /api/incidents/:id ──────────────────────────────────────────────────
// Actualiza solo campos editables. id, reporter, status y createdAt NO cambian
// (el estado solo se modifica por PATCH, para que siempre pase por el Reto 5).
export const update = (req: Request, res: Response): void => {
  const index = findOrFail(Number(req.params.id));
  const body = req.body as Partial<CreateIncidentDto>;
  const current = incidents[index];

  incidents[index] = {
    ...current,
    title: (body.title ?? current.title).trim(),
    description: (body.description ?? current.description).trim(),
    location: (body.location ?? current.location).trim(),
    priority: body.priority ?? current.priority,
    estimatedMinutes: body.estimatedMinutes ?? current.estimatedMinutes,
  };
  res.status(200).json({ ok: true, data: incidents[index] });
};

// ── PATCH /api/incidents/:id/status  (Reto 5) ───────────────────────────────
export const updateStatus = (req: Request, res: Response): void => {
  const index = findOrFail(Number(req.params.id));
  const status: unknown = req.body?.status;

  if (!isIncidentStatus(status)) {
    throw new AppError(400, "Invalid status. Allowed: OPEN, IN_PROGRESS, RESOLVED");
  }

  const current = incidents[index];
  if (!isValidStatusTransition(current.status, status)) {
    throw new AppError(400, `Invalid status transition: ${current.status} -> ${status}`);
  }

  incidents[index] = { ...current, status: status as IncidentStatus };
  res.status(200).json({ ok: true, data: incidents[index] });
};

// ── DELETE /api/incidents/:id  (la ruta aplica auth + admin) ────────────────
export const remove = (req: Request, res: Response): void => {
  const index = findOrFail(Number(req.params.id));
  incidents.splice(index, 1);
  res.status(204).send();
};