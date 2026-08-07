export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
export function formatDate(iso: string, opts?: { weekday?: boolean }): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: opts?.weekday ? "long" : undefined,
  }).format(date);
}
