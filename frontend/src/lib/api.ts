import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends the httpOnly refresh cookie
  headers: {
    // Required by the backend on any route that reads the refresh cookie
    // (see middleware/csrf.ts). Sent on every request here for simplicity —
    // it's harmless on routes that don't check it.
    "X-Nimbus-CSRF": "1",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true, headers: { "X-Nimbus-CSRF": "1" } }
    );
    setAccessToken(data.accessToken);
    return data.accessToken as string;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;

      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);
