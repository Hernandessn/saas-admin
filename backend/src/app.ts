import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { clientsRouter } from "./modules/clients/clients.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/clients", clientsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
