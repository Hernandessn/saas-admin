import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { ClientRecord } from "./types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ListClientsParams } from "./clients.api";

interface ClientsTableProps {
  items: ClientRecord[];
  loading: boolean;
  params: ListClientsParams;
  onSortChange: (sortBy: ListClientsParams["sortBy"]) => void;
  onEdit: (client: ClientRecord) => void;
  onDelete: (client: ClientRecord) => void;
  pagination: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPageChange: (page: number) => void;
}

const COLUMNS: { key: ListClientsParams["sortBy"]; label: string; className?: string }[] = [
  { key: "name", label: "Nome" },
  { key: "status", label: "Status" },
  { key: "value", label: "Valor", className: "text-right" },
  { key: "createdAt", label: "Criado em" },
];

export function ClientsTable({
  items,
  loading,
  params,
  onSortChange,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: ClientsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/8 bg-white shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-card-dark">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/8 dark:border-paper/10">
              {COLUMNS.map((col) => {
                const isActive = params.sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink/45 dark:text-paper/45",
                      col.className
                    )}
                  >
                    <button
                      onClick={() => onSortChange(col.key)}
                      className={cn(
                        "flex items-center gap-1 transition-colors duration-150 hover:text-ink dark:hover:text-paper",
                        col.className === "text-right" && "ml-auto"
                      )}
                    >
                      {col.label}
                      {isActive ? (
                        params.sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                );
              })}
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-ink/45 dark:text-paper/45">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8 dark:divide-paper/10">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/50 dark:text-paper/50">
                  Carregando registros...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/50 dark:text-paper/50">
                  Nenhum registro encontrado. Ajuste a busca ou crie um novo.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((client) => (
                <tr
                  key={client.id}
                  className="group transition-colors duration-150 hover:bg-ink/[0.02] dark:hover:bg-paper/[0.03]"
                >
                  <td className="px-5 py-3.5 font-medium text-ink dark:text-paper">{client.name}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-ink/80 dark:text-paper/80">
                    {formatCurrency(client.value)}
                  </td>
                  <td className="px-5 py-3.5 text-ink/60 dark:text-paper/60">{formatDate(client.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => onEdit(client)}
                        aria-label={`Editar ${client.name}`}
                        className="rounded-lg p-1.5 text-ink/50 transition-colors duration-150 hover:bg-brand-500/10 hover:text-brand-600 dark:text-paper/50 dark:hover:text-brand-300"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(client)}
                        aria-label={`Excluir ${client.name}`}
                        className="rounded-lg p-1.5 text-ink/50 transition-colors duration-150 hover:bg-status-churned/10 hover:text-status-churned dark:text-paper/50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/8 px-5 py-3.5 dark:border-paper/10 sm:flex-row">
          <p className="text-xs text-ink/50 dark:text-paper/50">
            Mostrando{" "}
            <span className="font-medium text-ink dark:text-paper">
              {(pagination.page - 1) * pagination.pageSize + 1}
              {"–"}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{" "}
            de <span className="font-medium text-ink dark:text-paper">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition-colors duration-150 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent dark:text-paper/60 dark:hover:bg-paper/10"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono text-xs text-ink/60 dark:text-paper/60">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition-colors duration-150 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent dark:text-paper/60 dark:hover:bg-paper/10"
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
