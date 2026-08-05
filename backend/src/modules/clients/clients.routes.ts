import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createClientHandler,
  deleteClientHandler,
  getClientHandler,
  listClientsHandler,
  metricsHandler,
  updateClientHandler,
} from "./clients.controller";

export const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get("/", listClientsHandler);
clientsRouter.get("/metrics", metricsHandler);
clientsRouter.get("/:id", getClientHandler);
clientsRouter.post("/", createClientHandler);
clientsRouter.patch("/:id", updateClientHandler);
clientsRouter.delete("/:id", deleteClientHandler);
