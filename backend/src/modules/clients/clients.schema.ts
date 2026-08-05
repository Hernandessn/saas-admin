import { z } from "zod";

export const clientStatusEnum = z.enum(["LEAD", "ACTIVE", "PAUSED", "CHURNED"]);

export const createClientSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres").max(120),
  status: clientStatusEnum.default("LEAD"),
  value: z.coerce.number().min(0, "O valor não pode ser negativo"),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
  sortBy: z.enum(["name", "status", "value", "createdAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  status: clientStatusEnum.optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
