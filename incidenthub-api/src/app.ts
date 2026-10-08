import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { requestInfoMiddleware } from "./middlewares/request-info.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import incidentRoutes from "./routes/incident.routes";

const app = express();

app.disable("x-powered-by");

// Middlewares globales (orden del enunciado): Logger -> Request Info -> JSON
app.use(loggerMiddleware);
app.use(requestInfoMiddleware);
app.use(express.json());

// Rutas
app.use("/api/incidents", incidentRoutes);

// Cierre global: SIEMPRE al final y en este orden
app.use(notFoundMiddleware); // 404 para rutas no registradas
app.use(errorMiddleware); // manejo centralizado de errores (AppError / 500)

export default app;