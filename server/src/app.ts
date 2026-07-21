import express, { Application } from "express";
import cors from "cors";
import { config } from "./config";
import router from "./routes";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
