import { ComponentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/status";
import { StatusDot } from "./status-dot";

interface StatusBannerProps {
  status: ComponentStatus;
  lastUpdatedAt?: Date;
  className?: string;
}

const bannerThemes: Record<ComponentStatus, string> = {
  operational: "status-glow-emerald bg-[var(--sp-emerald-soft)]",
  degraded: "status-glow-yellow bg-[var(--sp-yellow-soft)]",
  partial_outage: "status-glow-orange bg-[var(--sp-orange-soft)]",
  major_outage: "status-glow-red bg-[var(--sp-red-soft)]",
  maintenance: "status-glow-blue bg-[var(--sp-blue-soft)]",
};

const pillThemes: Record<ComponentStatus, string> = {
  operational: "bg-[var(--sp-emerald)]/10 text-[var(--sp-emerald)] border-[var(--sp-emerald)]/20",
  degraded: "bg-[var(--sp-yellow)]/10 text-[var(--sp-yellow)] border-[var(--sp-yellow)]/20",
  partial_outage: "bg-[var(--sp-orange)]/10 text-[var(--sp-orange)] border-[var(--sp-orange)]/20",
  major_outage: "bg-[var(--sp-red)]/10 text-[var(--sp-red)] border-[var(--sp-red)]/20",
  maintenance: "bg-[var(--sp-blue)]/10 text-[var(--sp-blue)] border-[var(--sp-blue)]/20",
};

export function StatusBanner({
  status,
  lastUpdatedAt,
  className,
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[var(--sp-border-strong)] p-10 text-center sm:p-14",
        bannerThemes[status],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-sm",
            pillThemes[status]
          )}
        >
          <StatusDot status={status} size="md" pulse />
          {statusLabel(status)}
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-[var(--sp-text)] sm:text-4xl">
          {status === "operational"
            ? "All systems operational"
            : statusLabel(status)}
        </h2>

        {lastUpdatedAt && (
          <p className="text-sm text-[var(--sp-text-secondary)]">
            Last updated{" "}
            {lastUpdatedAt.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
