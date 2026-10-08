import express from "express";
import incidentRoutes from "./routes/incident.routes";

const app = express();

app.use(express.json());

// Aquí irán los middlewares globales (logger, requestInfo)
app.use("/api/incidents", incidentRoutes);
// Aquí irá el middleware 404
// Aquí irá el error middleware (siempre al final)

export default app;
