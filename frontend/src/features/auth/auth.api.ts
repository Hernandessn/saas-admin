import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function refreshRequest() {
  const { data } = await api.post<AuthResponse>("/auth/refresh");
  return data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

export async function meRequest() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}
