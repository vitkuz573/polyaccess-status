import {
  Incident,
  IncidentUpdate,
  IncidentComponent,
  Component,
  IncidentStatus,
} from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { incidentStatusLabel } from "@/lib/status";

type IncidentWithRelations = Incident & {
  updates: IncidentUpdate[];
  components: (IncidentComponent & { component: Component })[];
};

interface IncidentHistoryCardProps {
  incident: IncidentWithRelations;
}

export function IncidentHistoryCard({ incident }: IncidentHistoryCardProps) {
  const latestUpdate = incident.updates[0];

  return (
    <div className="status-glass status-surface-hover flex items-start gap-4 rounded-2xl p-4 transition-colors">
      <div className="mt-0.5 shrink-0 rounded-full bg-[var(--sp-emerald-soft)] p-1.5 text-[var(--sp-emerald)]">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-medium text-[var(--sp-text)]">{incident.title}</h3>
          {incident.resolvedAt && (
            <time className="text-xs text-[var(--sp-text-tertiary)]">
              Resolved {formatDistanceToNow(incident.resolvedAt)} ago
            </time>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sp-text-secondary)]">
          {latestUpdate && (
            <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 font-medium text-[var(--sp-text-secondary)] ring-1 ring-inset ring-white/10">
              {incidentStatusLabel(latestUpdate.status as IncidentStatus)}
            </span>
          )}
          <span>{format(incident.startedAt, "MMM d, yyyy")}</span>
          {incident.components.length > 0 && (
            <>
              <span className="text-[var(--sp-text-tertiary)]">&middot;</span>
              <span className="truncate">
                {incident.components.map((ic) => ic.component.name).join(", ")}
              </span>
            </>
          )}
        </div>

        {latestUpdate && (
          <p className="line-clamp-2 text-sm text-[var(--sp-text-secondary)]">
            {latestUpdate.message}
          </p>
        )}
      </div>
    </div>
  );
}
