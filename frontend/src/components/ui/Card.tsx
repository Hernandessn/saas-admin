import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-ink/8 bg-white shadow-card",
        "dark:border-paper/10 dark:bg-ink-soft dark:shadow-card-dark",
        className
      )}
      {...props}
    />
  );
}
