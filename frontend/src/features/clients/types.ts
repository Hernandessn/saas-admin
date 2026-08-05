export type ClientStatus = "LEAD" | "ACTIVE" | "PAUSED" | "CHURNED";

export interface ClientRecord {
  id: string;
  name: string;
  status: ClientStatus;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientMetrics {
  total: number;
  active: number;
  createdThisMonth: number;
  growthPct: number;
}

export const STATUS_LABEL: Record<ClientStatus, string> = {
  LEAD: "Lead",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  CHURNED: "Perdido",
};
