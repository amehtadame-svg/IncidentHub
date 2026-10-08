import express from "express";
import { validateId } from "./middlewares/validate-id.middleware";
import {
  validateIncident,
  validateIncidentUpdate,
} from "./middlewares/validate-incident.middleware";
import { validatePriority } from "./middlewares/validate-priority.middleware";
import { validateTime } from "./middlewares/validate-time.middleware";

const app = express();
app.use(express.json());

// ─── Prueba validateId ───
app.get("/test/:id", validateId, (req, res) => {
  res.json({ ok: true, message: "ID válido" });
});

// ─── Prueba validateIncident + validatePriority + validateTime (POST) ───
app.post(
  "/test",
  validateIncident,
  validatePriority,
  validateTime,
  (req, res) => {
    res.status(201).json({ ok: true, message: "Datos válidos para crear" });
  }
);

// ─── Prueba validateIncidentUpdate + validatePriority + validateTime (PUT) ───
app.put(
  "/test/:id",
  validateId,
  validateIncidentUpdate,
  validatePriority,
  validateTime,
  (req, res) => {
    res.status(200).json({ ok: true, message: "Datos válidos para actualizar" });
  }
);

// ─── Manejador de errores temporal ───
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || "Internal server error",
  });
});

app.listen(4000, () => console.log("Test server en puerto 4000"));