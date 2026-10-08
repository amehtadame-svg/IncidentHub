import type { RequestHandler } from "express";
import { incidents } from "../data/incidents.data";
import { canTransitionIncidentStatus } from "../utils/incident-status-transitions";

/** Actualiza únicamente el estado después de validar ID y transición. */
export const patchIncidentStatus: RequestHandler = (req, res): void => {
  const incidentId: number = res.locals.incidentId;
  const incident = incidents.find((current) => current.id === incidentId);

  if (!incident) {
    res.status(404).json({ message: `No existe un incidente con ID ${incidentId}.` });
    return;
  }

  const requestedStatus: unknown = req.body?.status;
  if (!canTransitionIncidentStatus(incident.status, requestedStatus)) {
    res.status(400).json({
      message: `No se permite la transición de ${incident.status} a ${String(requestedStatus)}.`,
    });
    return;
  }

  incident.status = requestedStatus;
  res.status(200).json(incident);
};
