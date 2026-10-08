import express from "express";
import { requestInfoMiddleware } from "./middlewares/request-info.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

// ── Middlewares globales (Persona 3 - Infraestructura) ──────────────────────
app.use(requestInfoMiddleware); // 1. enriquece req (requestId, startTime)
app.use(loggerMiddleware); // 2. log de cada peticion (usa el requestId)

// ── Rutas (Persona 4 las conecta aqui) ─────────────────────────────────────
// app.use("/api/incidents", incidentRoutes);

// ── Cierre global (Persona 3) - SIEMPRE al final, en este orden ────────────
app.use(notFoundMiddleware); // 404 para rutas no registradas
app.use(errorMiddleware); // manejo centralizado de errores (AppError / 500)

export default app;
