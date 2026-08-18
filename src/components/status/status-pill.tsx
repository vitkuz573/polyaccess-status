import { ComponentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/status";

interface StatusPillProps {
  status: ComponentStatus;
  size?: "sm" | "md";
  className?: string;
}

const themeClasses: Record<ComponentStatus, string> = {
  operational: "bg-[var(--sp-emerald-soft)] text-[var(--sp-emerald)] ring-[var(--sp-emerald)]/20",
  degraded: "bg-[var(--sp-yellow-soft)] text-[var(--sp-yellow)] ring-[var(--sp-yellow)]/20",
  partial_outage: "bg-[var(--sp-orange-soft)] text-[var(--sp-orange)] ring-[var(--sp-orange)]/20",
  major_outage: "bg-[var(--sp-red-soft)] text-[var(--sp-red)] ring-[var(--sp-red)]/20",
  maintenance: "bg-[var(--sp-blue-soft)] text-[var(--sp-blue)] ring-[var(--sp-blue)]/20",
};

export function StatusPill({ status, size = "sm", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium ring-1 ring-inset",
        size === "sm" ? "text-xs" : "text-sm",
        themeClasses[status],
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
