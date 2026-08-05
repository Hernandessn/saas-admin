import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  delta?: number;
  deltaLabel?: string;
}

export function MetricCard({ label, value, icon, delta, deltaLabel }: MetricCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-lg">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/5 transition-transform duration-200 group-hover:scale-110 dark:bg-volt/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink/55 dark:text-paper/55">{label}</p>
          <p className="mt-2 font-mono text-3xl font-medium tabular-nums text-ink dark:text-paper">
            {value}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-volt/10 dark:text-volt">
          {icon}
        </span>
      </div>

      {typeof delta === "number" && (
        <div className="relative mt-4 flex items-center gap-1.5">
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-xs font-medium",
              isPositive
                ? "bg-status-active/10 text-status-active"
                : "bg-status-churned/10 text-status-churned"
            )}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta)}%
          </span>
          <span className="text-xs text-ink/45 dark:text-paper/45">{deltaLabel}</span>
        </div>
      )}
    </Card>
  );
}
