import {
  Incident,
  IncidentUpdate,
  IncidentComponent,
  Component,
  IncidentStatus,
  IncidentImpact,
} from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { incidentImpactTheme, incidentStatusLabel } from "@/lib/status";

type IncidentWithRelations = Incident & {
  updates: IncidentUpdate[];
  components: (IncidentComponent & { component: Component })[];
};

interface IncidentCardProps {
  incident: IncidentWithRelations;
}

const impactBorderColors: Record<IncidentImpact, string> = {
  none: "var(--sp-emerald)",
  minor: "var(--sp-yellow)",
  major: "var(--sp-orange)",
  critical: "var(--sp-red)",
};

export function IncidentCard({ incident }: IncidentCardProps) {
  const theme = incidentImpactTheme(incident.impact);

  return (
    <div
      className="status-glass overflow-hidden rounded-2xl border-l-4"
      style={{ borderLeftColor: impactBorderColors[incident.impact] }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
              {incident.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--sp-text-secondary)]">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                style={{
                  background: theme.bgSoft,
                  color: theme.text,
                }}
              >
                <AlertTriangle className="h-3 w-3" />
                {incident.impact}
              </span>
              <span>Started {formatDistanceToNow(incident.startedAt)} ago</span>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--sp-text-secondary)] ring-1 ring-inset ring-white/10">
            {incidentStatusLabel(incident.status as IncidentStatus)}
          </span>
        </div>

        {incident.components.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {incident.components.map((ic) => (
              <span
                key={ic.componentId}
                className="inline-flex items-center rounded-md border border-[var(--sp-border)] bg-[var(--sp-surface)] px-2 py-1 text-xs font-medium text-[var(--sp-text-secondary)]"
              >
                {ic.component.name}
              </span>
            ))}
          </div>
        )}

        {incident.description && (
          <p className="mt-4 text-sm leading-relaxed text-[var(--sp-text-secondary)]">
            {incident.description}
          </p>
        )}
      </div>

      <div className="border-t border-[var(--sp-border)] bg-[var(--sp-surface)]/30 p-5 sm:p-6">
        <div className="relative space-y-6">
          <div className="absolute top-2 bottom-2 left-2 w-px bg-[var(--sp-border)]" />
          {incident.updates.map((update, index) => (
            <div key={update.id} className="relative pl-7">
              <span
                className={cn(
                  "absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 border-[var(--sp-bg-elevated)] bg-[var(--sp-surface)] ring-1 ring-[var(--sp-border)]",
                  index === 0 && "bg-[var(--sp-emerald)] ring-[var(--sp-emerald)]/30"
                )}
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--sp-text)]">
                    {incidentStatusLabel(update.status as IncidentStatus)}
                  </span>
                  {index === 0 && (
                    <span className="text-xs font-medium text-[var(--sp-text-tertiary)]">
                      Latest
                    </span>
                  )}
                </div>
                <time className="block text-xs text-[var(--sp-text-tertiary)]">
                  {format(update.createdAt, "PPp")}
                </time>
                <p className="text-sm leading-relaxed text-[var(--sp-text-secondary)]">
                  {update.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
