import { Request, Response } from "express";
import { incidents } from "../data/incidents.data";
import { CreateIncidentDto } from "../dtos/incident.dto";
import { Incident, IncidentStatus } from "../models/incident.model";
import { AppError } from "../errors/app-error";
import { isIncidentStatus, isValidStatusTransition } from "../utils/status-transitions";

/**
 * Lógica de negocio de cada endpoint (Persona 4 - 35 pts).
 *
 * Consume: Model/DTO/Data de P1, AppError de P3 y (a través de las rutas)
 * las validaciones de P2. Los datos viven en memoria (array semilla de P1).
 *
 * Contratos de respuesta:
 *   - Éxito: 200 (GET/PUT/PATCH), 201 (POST), 204 sin body (DELETE)
 *   - Error: AppError -> errorMiddleware -> { "status": "error", "message": ... }
 */

const findIndexById = (id: number): number => incidents.findIndex((i) => i.id === id);

const nextId = (): number => incidents.reduce((max, i) => Math.max(max, i.id), 0) + 1;

// ── GET /api/incidents ──────────────────────────────────────────────────────
export const getAll = (_req: Request, res: Response): void => {
  res.status(200).json(incidents);
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
  const byPriority: Record<Incident["priority"], number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  let totalMinutes = 0;

  for (const inc of incidents) {
    byStatus[inc.status] += 1;
    byPriority[inc.priority] += 1;
    totalMinutes += inc.estimatedMinutes;
  }

  res.status(200).json({
    total: incidents.length,
    byStatus,
    byPriority,
    averageEstimatedMinutes:
      incidents.length > 0 ? Math.round((totalMinutes / incidents.length) * 100) / 100 : 0,
    criticalPending: incidents.filter((i) => i.priority === "CRITICAL" && i.status !== "RESOLVED")
      .length,
  });
};

// ── GET /api/incidents/:id ──────────────────────────────────────────────────
export const getById = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  res.status(200).json(incident);
};

// ── POST /api/incidents ─────────────────────────────────────────────────────
// Crea un incidente: id autoincremental, estado inicial OPEN, createdAt ahora.
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
// Si el body trae un status válido se respeta; si no, se conserva el actual.
export const update = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = findIndexById(id);
  if (index === -1) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  const dto = req.body as CreateIncidentDto;
  const current = incidents[index];
  const status: IncidentStatus = isIncidentStatus(req.body?.status) ? req.body.status : current.status;

  incidents[index] = {
    ...current,
    title: dto.title.trim(),
    description: dto.description.trim(),
    reporter: dto.reporter.trim(),
    location: dto.location.trim(),
    priority: dto.priority,
    estimatedMinutes: dto.estimatedMinutes,
    status,
  };
  res.status(200).json(incidents[index]);
};

// ── PATCH /api/incidents/:id/status ─────────────────────────────────────────
// Reto 5: solo transiciones de estado válidas (ver utils/status-transitions).
export const updateStatus = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = findIndexById(id);
  if (index === -1) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }

  const status = req.body?.status;
  if (!isIncidentStatus(status)) {
    throw new AppError(
      400,
      `El campo 'status' es obligatorio y debe ser uno de: OPEN, IN_PROGRESS, RESOLVED (recibido: ${JSON.stringify(status)})`,
    );
  }

  const current = incidents[index];
  if (!isValidStatusTransition(current.status, status)) {
    throw new AppError(
      400,
      `Transición de estado inválida (Reto 5): ${current.status} -> ${status}. ` +
        "Transiciones válidas: OPEN->IN_PROGRESS, OPEN->RESOLVED, IN_PROGRESS->RESOLVED",
    );
  }

  incidents[index] = { ...current, status };
  res.status(200).json(incidents[index]);
};

// ── DELETE /api/incidents/:id ───────────────────────────────────────────────
// Solo admin: la ruta aplica authMiddleware + adminMiddleware (Persona 3).
export const remove = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = findIndexById(id);
  if (index === -1) {
    throw new AppError(404, `Incidente con id ${id} no encontrado`);
  }
  incidents.splice(index, 1);
  res.status(204).send();
};
