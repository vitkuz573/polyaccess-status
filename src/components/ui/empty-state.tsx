import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border-strong)] bg-[var(--sp-surface)] py-12 text-center",
        className
      )}
    >
      <Icon className={cn("h-10 w-10 text-[var(--sp-text-tertiary)]", iconClassName)} />
      <p className="mt-4 text-sm font-semibold text-[var(--sp-text)]">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-[var(--sp-text-tertiary)]">{description}</p>
    </div>
  );
}
