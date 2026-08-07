import { useCallback, useEffect, useState } from "react";
import { listClients, ListClientsParams } from "@/features/clients/clients.api";
import { ClientRecord, Paginated } from "@/features/clients/types";

const DEFAULT_PARAMS: ListClientsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "createdAt",
  sortDir: "desc",
};

export function useClients(initialParams: Partial<ListClientsParams> = {}) {
  const [params, setParams] = useState<ListClientsParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
  });
  const [data, setData] = useState<Paginated<ClientRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listClients(params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load records.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params, reloadKey]);

  return { data, loading, error, params, setParams, reload };
}
