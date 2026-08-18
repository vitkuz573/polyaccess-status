import {
  Component,
  ComponentStatus,
  Check,
  CheckResult,
  ComponentGroup,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import { uptimePercentage, statusLabel } from "@/lib/status";
import { StatusDot } from "./status-dot";

type ComponentWithChecks = Component & {
  group: ComponentGroup | null;
  checks: (Check & { results: CheckResult[] })[];
};

interface ComponentGroupCardProps {
  groupName: string;
  components: ComponentWithChecks[];
}

const statusColors: Record<ComponentStatus, string> = {
  operational: "var(--sp-emerald)",
  degraded: "var(--sp-yellow)",
  partial_outage: "var(--sp-orange)",
  major_outage: "var(--sp-red)",
  maintenance: "var(--sp-blue)",
};

export function ComponentGroupCard({
  groupName,
  components,
}: ComponentGroupCardProps) {
  const sorted = [...components].sort((a, b) => a.position - b.position);

  return (
    <section>
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-[var(--sp-text-tertiary)]">
        {groupName}
      </h3>
      <div className="status-glass overflow-hidden rounded-2xl">
        {sorted.map((component, index) => {
          const results = component.checks.flatMap((ch) => ch.results);
          const uptime = uptimePercentage(results);

          return (
            <div
              key={component.id}
              className={cn(
                "status-surface-hover transition-colors",
                index !== sorted.length - 1 && "border-b border-[var(--sp-border)]"
              )}
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-[var(--sp-text)]">
                      {component.name}
                    </span>
                  </div>
                  {component.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-[var(--sp-text-secondary)]">
                      {component.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <span className="hidden tabular-nums text-[var(--sp-text-tertiary)] sm:inline">
                    {uptime.toFixed(2)}% uptime
                  </span>
                  <div className="flex w-[7.5rem] items-center justify-end gap-2">
                    <StatusDot status={component.status} pulse glow={false} />
                    <span className="font-medium text-[var(--sp-text)]">
                      {statusLabel(component.status as ComponentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4 sm:px-6">
                <UptimeBar value={uptime} status={component.status} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UptimeBar({ value, status }: { value: number; status: ComponentStatus }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundColor: statusColors[status],
          boxShadow: `0 0 12px ${statusColors[status]}`,
        }}
      />
    </div>
  );
}
