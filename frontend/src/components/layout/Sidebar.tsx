import { NavLink } from "react-router-dom";
import { LayoutGrid, Users, ChevronsLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutGrid, end: true },
  { to: "/dashboard/clientes", label: "Clientes", icon: Users, end: false },
];

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-ink/8 bg-white transition-all duration-200 dark:border-paper/10 dark:bg-ink-soft",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-display text-base font-semibold text-volt">
          N
        </span>
        {!collapsed && (
          <span className="font-display text-lg font-medium text-ink dark:text-paper">Nimbus</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-200"
                  : "text-ink/60 hover:bg-ink/5 hover:text-ink dark:text-paper/60 dark:hover:bg-paper/10 dark:hover:text-paper"
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink/8 p-3 dark:border-paper/10">
        <div className={cn("flex items-center gap-3 rounded-lg px-2 py-2", collapsed && "justify-center px-0")}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-medium text-brand-700 dark:bg-brand-400/20 dark:text-brand-200">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink dark:text-paper">{user?.name}</p>
              <p className="truncate text-xs text-ink/50 dark:text-paper/50">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => logout()}
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/60 transition-colors duration-150 hover:bg-status-churned/10 hover:text-status-churned dark:text-paper/60",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            "mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/50 transition-colors duration-150 hover:bg-ink/5 hover:text-ink dark:text-paper/50 dark:hover:bg-paper/10 dark:hover:text-paper lg:flex",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronsLeft size={16} className={cn("shrink-0 transition-transform duration-200", collapsed && "rotate-180")} />
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
