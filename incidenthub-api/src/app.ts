import express from "express";
import incidentRoutes from "./routes/incident.routes";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { requestInfoMiddleware } from "./middlewares/request-info.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.disable("x-powered-by");
app.use(loggerMiddleware);
app.use(requestInfoMiddleware);
app.use(express.json());

app.use("/api/incidents", incidentRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;