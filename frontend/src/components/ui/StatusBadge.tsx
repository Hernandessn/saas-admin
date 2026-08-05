import { ClientStatus, STATUS_LABEL } from "@/features/clients/types";
import { cn } from "@/lib/cn";

const dotColor: Record<ClientStatus, string> = {
  LEAD: "bg-status-lead",
  ACTIVE: "bg-status-active",
  PAUSED: "bg-status-paused",
  CHURNED: "bg-status-churned",
};

const textColor: Record<ClientStatus, string> = {
  LEAD: "text-status-lead",
  ACTIVE: "text-status-active",
  PAUSED: "text-status-paused",
  CHURNED: "text-status-churned",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-current/5 px-2.5 py-1 text-xs font-medium",
        textColor[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
