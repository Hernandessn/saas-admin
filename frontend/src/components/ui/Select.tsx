import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink/80 dark:text-paper/80">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink",
            "outline-none transition-all duration-150 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            "dark:border-paper/15 dark:bg-white/5 dark:text-paper",
            error && "border-status-churned",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs font-medium text-status-churned">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
