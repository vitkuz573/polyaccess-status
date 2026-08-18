import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/status/status-dot";
import {
  ComponentStatus,
  MaintenanceStatus,
  IncidentImpact,
} from "@prisma/client";
import {
  statusLabel,
  statusBgSoftClass,
  statusTextClass,
  statusBorderClass,
  maintenanceStatusTheme,
  maintenanceStatusLabel,
  incidentImpactTheme,
  incidentStatusLabel,
  incidentImpactStatusMap,
} from "@/lib/status";

interface ComponentStatusBadgeProps {
  status: ComponentStatus;
  showDot?: boolean;
  className?: string;
}

export function ComponentStatusBadge({
  status,
  showDot = true,
  className,
}: ComponentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusBgSoftClass(status),
        statusTextClass(status),
        statusBorderClass(status),
        className
      )}
    >
      {showDot && <StatusDot status={status} size="sm" />}
      {statusLabel(status)}
    </span>
  );
}

interface MaintenanceStatusBadgeProps {
  status: MaintenanceStatus;
  showDot?: boolean;
  className?: string;
}

const tailwindToComponentStatus: Record<string, ComponentStatus> = {
  emerald: "operational",
  yellow: "degraded",
  orange: "partial_outage",
  red: "major_outage",
  blue: "maintenance",
};

export function MaintenanceStatusBadge({
  status,
  showDot = true,
  className,
}: MaintenanceStatusBadgeProps) {
  const theme = maintenanceStatusTheme(status);
  const colorName = theme.color.replace("bg-", "").replace("-500", "");
  const dotStatus = tailwindToComponentStatus[colorName] ?? "operational";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        theme.bgSoft,
        theme.text,
        theme.border,
        className
      )}
    >
      {showDot && <StatusDot status={dotStatus} size="sm" />}
      {maintenanceStatusLabel(status)}
    </span>
  );
}

interface IncidentStatusBadgeProps {
  impact: IncidentImpact;
  statusLabel?: string;
  showDot?: boolean;
  className?: string;
}

export function IncidentStatusBadge({
  impact,
  statusLabel: label,
  showDot = true,
  className,
}: IncidentStatusBadgeProps) {
  const theme = incidentImpactTheme(impact);
  const status = incidentImpactStatusMap[impact];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        theme.bgSoft,
        theme.text,
        theme.border,
        className
      )}
    >
      {showDot && <StatusDot status={status} size="sm" />}
      {label ?? incidentStatusLabel("investigating")}
    </span>
  );
}
