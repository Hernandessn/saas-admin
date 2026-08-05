import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/cn";

const TITLES: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/dashboard/clientes": "Clientes",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title =
    TITLES[location.pathname] ??
    (location.pathname.startsWith("/dashboard/clientes") ? "Clientes" : "Visão geral");

  return (
    <div className="flex h-screen overflow-hidden bg-paper dark:bg-ink">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className={cn("relative z-50 h-full animate-scale-in")}>
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
