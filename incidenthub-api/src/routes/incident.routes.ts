import { Router } from "express";
import * as controller from "../controllers/incident.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validateId } from "../middlewares/validate-id.middleware";
import { validateIncident, validateIncidentUpdate } from "../middlewares/validate-incident.middleware";
import { validatePriority } from "../middlewares/validate-priority.middleware";
import { validateTime } from "../middlewares/validate-time.middleware";

/**
 * Rutas de incidentes (Persona 4): define el ORDEN de los middlewares.
 *
 * - Lecturas (GET): públicas, como en los cURL del enunciado.
 * - Escrituras (POST/PUT/PATCH/DELETE): requieren token (auth).
 * - DELETE: además requiere rol admin.
 * - /critical, /pending y /stats van ANTES de /:id; si no, Express los
 *   interpretaría como un id y validateId respondería 400.
 */
const router = Router();

// Consultas fijas (retos 1, 2 y 3) — siempre antes de /:id
router.get("/critical", controller.getCritical);
router.get("/pending", controller.getPending);
router.get("/stats", controller.getStats);

// CRUD
router.get("/", controller.getAll);
router.get("/:id", validateId, controller.getById);

router.post("/", authMiddleware, validateIncident, validatePriority, validateTime, controller.create);

router.put(
  "/:id",
  authMiddleware,
  validateId,
  validateIncidentUpdate, // PUT: reporter no es obligatorio ni modificable
  validatePriority,
  validateTime,
  controller.update,
);

router.patch("/:id/status", authMiddleware, validateId, controller.updateStatus);

router.delete("/:id", authMiddleware, adminMiddleware, validateId, controller.remove);

export default router;