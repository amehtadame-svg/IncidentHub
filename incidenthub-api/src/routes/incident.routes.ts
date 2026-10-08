import { Router } from "express";
import { patchIncidentStatus } from "../controllers/incident.controller";
import { validateId } from "../middlewares/validate-id.middleware";

const incidentRoutes = Router();

incidentRoutes.patch("/:id/status", validateId, patchIncidentStatus);

export default incidentRoutes;
