import {
  Maintenance,
  MaintenanceComponent,
  Component,
  MaintenanceStatus,
} from "@prisma/client";
import { format } from "date-fns";
import { Wrench, Clock } from "lucide-react";
import { maintenanceStatusTheme } from "@/lib/status";

type MaintenanceWithRelations = Maintenance & {
  components: (MaintenanceComponent & { component: Component })[];
};

interface MaintenanceCardProps {
  maintenance: MaintenanceWithRelations;
}

export function MaintenanceCard({ maintenance }: MaintenanceCardProps) {
  const theme = maintenanceStatusTheme(maintenance.status as MaintenanceStatus);

  return (
    <div
      className="status-glass overflow-hidden rounded-2xl border-l-4"
      style={{ borderLeftColor: "var(--sp-blue)" }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
              {maintenance.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--sp-text-secondary)]">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                style={{ background: theme.bgSoft, color: theme.text }}
              >
                <Wrench className="h-3 w-3" />
                {theme.label}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--sp-text-tertiary)]" />
                {format(maintenance.startsAt, "PPp")}
                {maintenance.endsAt && ` — ${format(maintenance.endsAt, "PPp")}`}
              </span>
            </div>
          </div>
        </div>

        {maintenance.components.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {maintenance.components.map((mc) => (
              <span
                key={mc.componentId}
                className="inline-flex items-center rounded-md border border-[var(--sp-border)] bg-[var(--sp-surface)] px-2 py-1 text-xs font-medium text-[var(--sp-text-secondary)]"
              >
                {mc.component.name}
              </span>
            ))}
          </div>
        )}

        {maintenance.description && (
          <p className="mt-4 text-sm leading-relaxed text-[var(--sp-text-secondary)]">
            {maintenance.description}
          </p>
        )}
      </div>
    </div>
  );
}
