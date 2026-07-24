import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import router from "./routes";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { UPLOAD_DIR } from "./modules/upload/upload.service";

const app: Application = express();

const corsOrigin = config.clientOrigin.filter((origin): origin is string => Boolean(origin));

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
