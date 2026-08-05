import { useEffect, useState } from "react";
import { getClientMetrics } from "@/features/clients/clients.api";
import { ClientMetrics } from "@/features/clients/types";

export function useClientMetrics() {
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getClientMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { metrics, loading };
}
