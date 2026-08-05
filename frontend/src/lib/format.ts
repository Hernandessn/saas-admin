export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(iso: string, opts?: { weekday?: boolean }): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: opts?.weekday ? "long" : undefined,
  }).format(date);
}
