import { Router } from "express";
import * as controller from "../controllers/incident.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validateId } from "../middlewares/validate-id.middleware";
import { validateIncident, validateIncidentUpdate } from "../middlewares/validate-incident.middleware";
import { validatePriority } from "../middlewares/validate-priority.middleware";
import { validateTime } from "../middlewares/validate-time.middleware";

/**
 * Definición de rutas y orden de middlewares (Persona 4 - 35 pts).
 *
 * Middlewares de validación: entrega REAL de P2 (rama ameht) — reemplazan
 * los stubs que P4 usó para avanzar en paralelo. validate-time se implementó
 * en la integración (P2 pendiente) con el Reto 4 documentado.
 *
 * ⚠️ ORDEN CRÍTICO: las rutas estáticas de los retos (/critical, /pending,
 * /stats) van ANTES de /:id; si no, Express las capturaría como si fueran
 * un id y nunca llegarían al controller.
 */
const router = Router();

// Todas las rutas de incidentes requieren autenticación (Persona 3)
router.use(authMiddleware);

// ── Retos de consulta (siempre antes de /:id) ───────────────────────────────
router.get("/critical", controller.getCritical); // Reto 1
router.get("/pending", controller.getPending); // Reto 2
router.get("/stats", controller.getStats); // Reto 3

// ── CRUD completo ───────────────────────────────────────────────────────────
router.get("/", controller.getAll);
router.get("/:id", validateId, controller.getById);
router.post("/", validateIncident, validatePriority, validateTime, controller.create);
router.put(
  "/:id",
  validateId,
  validateIncidentUpdate, // PUT: no exige reporter, bloquea modificar id (P2)
  validatePriority,
  validateTime,
  controller.update,
);
router.patch("/:id/status", validateId, controller.updateStatus); // Reto 5
router.delete("/:id", validateId, adminMiddleware, controller.remove); // solo admin

export default router;
