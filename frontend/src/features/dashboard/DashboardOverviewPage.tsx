import { Link } from "react-router-dom";
import { Users, UserCheck, TrendingUp, ArrowRight } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useClientMetrics } from "@/hooks/useClientMetrics";
import { useClients } from "@/hooks/useClients";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";

export function DashboardOverviewPage() {
  const { metrics, loading: metricsLoading } = useClientMetrics();
  const { data, loading: clientsLoading } = useClients({ pageSize: 6, sortBy: "createdAt", sortDir: "desc" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
          Aqui está o resumo da sua base de clientes hoje, {formatDate(new Date().toISOString(), { weekday: true })}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total de registros"
          value={metricsLoading ? "—" : String(metrics?.total ?? 0)}
          icon={<Users size={18} />}
        />
        <MetricCard
          label="Clientes ativos"
          value={metricsLoading ? "—" : String(metrics?.active ?? 0)}
          icon={<UserCheck size={18} />}
        />
        <MetricCard
          label="Crescimento no mês"
          value={metricsLoading ? "—" : `${metrics?.createdThisMonth ?? 0} novos`}
          icon={<TrendingUp size={18} />}
          delta={metrics?.growthPct}
          deltaLabel="vs. mês anterior"
        />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4 dark:border-paper/10">
          <h3 className="font-display text-lg font-medium text-ink dark:text-paper">
            Registros recentes
          </h3>
          <Link
            to="/dashboard/clientes"
            className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors duration-150 hover:text-brand-600"
          >
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-ink/8 dark:divide-paper/10">
          {clientsLoading && (
            <div className="px-5 py-8 text-center text-sm text-ink/50 dark:text-paper/50">
              Carregando...
            </div>
          )}
          {!clientsLoading && data?.items.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-ink/50 dark:text-paper/50">
              Nenhum registro ainda.
            </div>
          )}
          {!clientsLoading &&
            data?.items.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-ink/[0.02] dark:hover:bg-paper/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink dark:text-paper">{client.name}</p>
                  <p className="text-xs text-ink/45 dark:text-paper/45">
                    Criado em {formatDate(client.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-mono text-sm text-ink/70 dark:text-paper/70">
                    {formatCurrency(client.value)}
                  </span>
                  <StatusBadge status={client.status} />
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
