import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { setAccessToken } from "@/lib/api";
import {
  User,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "./auth.api";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  useEffect(() => {
    // On load, try to silently refresh using the httpOnly cookie.
    (async () => {
      try {
        const data = await refreshRequest();
        setAccessToken(data.accessToken);
        setUser(data.user);
        setStatus("authenticated");
      } catch {
        setAccessToken(null);
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => {});
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
