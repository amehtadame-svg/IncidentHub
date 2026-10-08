import { Router } from "express";
import * as controller from "../controllers/incident.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validateIdMiddleware } from "../middlewares/validate-id.middleware";
import { validateIncidentMiddleware } from "../middlewares/validate-incident.middleware";
import { validatePriorityMiddleware } from "../middlewares/validate-priority.middleware";
import { validateTimeMiddleware } from "../middlewares/validate-time.middleware";

/**
 * Definición de rutas y orden de middlewares (Persona 4 - 35 pts).
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
router.get("/:id", validateIdMiddleware, controller.getById);
router.post(
  "/",
  validateIncidentMiddleware,
  validatePriorityMiddleware,
  validateTimeMiddleware,
  controller.create,
);
router.put(
  "/:id",
  validateIdMiddleware,
  validateIncidentMiddleware,
  validatePriorityMiddleware,
  validateTimeMiddleware,
  controller.update,
);
router.patch("/:id/status", validateIdMiddleware, controller.updateStatus); // Reto 5
router.delete("/:id", validateIdMiddleware, adminMiddleware, controller.remove); // solo admin

export default router;
