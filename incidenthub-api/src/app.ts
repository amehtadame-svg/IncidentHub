import express from "express";

const app = express();

app.use(express.json());

// Aquí irán los middlewares globales (logger, requestInfo)
// Aquí irán las rutas: app.use("/api/incidents", incidentRoutes);
// Aquí irá el middleware 404
// Aquí irá el error middleware (siempre al final)

export default app;