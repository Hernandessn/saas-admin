import { asyncHandler } from "../../utils/asyncHandler";
import { AuthedRequest } from "../../middleware/auth";
import {
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from "./clients.schema";
import * as clientsService from "./clients.service";

export const listClientsHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const query = listClientsQuerySchema.parse(req.query);
  const result = await clientsService.listClients(query, req.user!.id);
  res.json(result);
});

export const metricsHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const metrics = await clientsService.getClientMetrics(req.user!.id);
  res.json(metrics);
});

export const getClientHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const client = await clientsService.getClientById(req.params.id, req.user!.id);
  res.json({ client });
});

export const createClientHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const input = createClientSchema.parse(req.body);
  const client = await clientsService.createClient(input, req.user!.id);
  res.status(201).json({ client });
});

export const updateClientHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const input = updateClientSchema.parse(req.body);
  const client = await clientsService.updateClient(req.params.id, input, req.user!.id);
  res.json({ client });
});

export const deleteClientHandler = asyncHandler(async (req: AuthedRequest, res) => {
  await clientsService.deleteClient(req.params.id, req.user!.id);
  res.status(204).send();
});
