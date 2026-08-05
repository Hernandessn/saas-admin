import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink/80 dark:text-paper/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink placeholder:text-ink/35",
            "outline-none transition-all duration-150 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            "dark:border-paper/15 dark:bg-ink-soft dark:bg-white/5 dark:text-paper dark:placeholder:text-paper/35",
            error && "border-status-churned focus:border-status-churned focus:ring-status-churned/10",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <span className="text-xs text-ink/50 dark:text-paper/50">{hint}</span>}
        {error && <span className="text-xs font-medium text-status-churned">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
