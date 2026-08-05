import { api } from "@/lib/api";
import { ClientMetrics, ClientRecord, ClientStatus, Paginated } from "./types";

export interface ListClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy: "name" | "status" | "value" | "createdAt";
  sortDir: "asc" | "desc";
  status?: ClientStatus;
}

export async function listClients(params: ListClientsParams): Promise<Paginated<ClientRecord>> {
  const { data } = await api.get<Paginated<ClientRecord>>("/clients", { params });
  return data;
}

export async function getClientMetrics(): Promise<ClientMetrics> {
  const { data } = await api.get<ClientMetrics>("/clients/metrics");
  return data;
}

export interface ClientFormValues {
  name: string;
  status: ClientStatus;
  value: number;
}

export async function createClient(input: ClientFormValues): Promise<ClientRecord> {
  const { data } = await api.post<{ client: ClientRecord }>("/clients", input);
  return data.client;
}

export async function updateClient(id: string, input: Partial<ClientFormValues>): Promise<ClientRecord> {
  const { data } = await api.patch<{ client: ClientRecord }>(`/clients/${id}`, input);
  return data.client;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
