import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientsTable } from "./ClientsTable";
import { ClientFormModal } from "./ClientFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ClientRecord, STATUS_LABEL } from "./types";
import { ClientFormValues } from "./clients.schema";
import * as clientsApi from "./clients.api";
import { ListClientsParams } from "./clients.api";

export function ClientsPage() {
  const { data, loading, params, setParams, reload } = useClients();
  const [searchInput, setSearchInput] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const applySearch = (value: string) => {
    setSearchInput(value);
    setParams((p) => ({ ...p, search: value, page: 1 }));
  };

  const handleSortChange = (sortBy: ListClientsParams["sortBy"]) => {
    setParams((p) => ({
      ...p,
      sortBy,
      sortDir: p.sortBy === sortBy && p.sortDir === "asc" ? "desc" : "asc",
    }));
  };

  const handleStatusFilter = (value: string) => {
    setParams((p) => ({
      ...p,
      status: value ? (value as any) : undefined,
      page: 1,
    }));
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const openEditModal = (client: ClientRecord) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: ClientFormValues) => {
    if (editingClient) {
      await clientsApi.updateClient(editingClient.id, values);
    } else {
      await clientsApi.createClient(values);
    }
    reload();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clientsApi.deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">
            Clients
          </h2>
          <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
            Manage your clients, leads, and opportunities.
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={16} />
          New record
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40"
          />
          <Input
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => applySearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          className="sm:w-48"
          value={params.status ?? ""}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option
              key={value}
              value={value}
              className="bg-zinc-900 text-white"
            >
              {label}
            </option>
          ))}
        </Select>
      </div>

      <ClientsTable
        items={data?.items ?? []}
        loading={loading}
        params={params}
        onSortChange={handleSortChange}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        pagination={data?.pagination}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      />

      <ClientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingClient}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title="Delete record"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
