import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
