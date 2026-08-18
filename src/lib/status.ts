import { ComponentStatus, IncidentImpact, IncidentStatus, MaintenanceStatus } from "@prisma/client";

export type StatusTheme = {
  label: string;
  color: string;
  text: string;
  border: string;
  bg: string;
  bgSoft: string;
  icon: string;
  glow: string;
};

export const statusMeta: Record<ComponentStatus, StatusTheme> = {
  operational: {
    label: "Operational",
    color: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-500/10",
    icon: "●",
    glow: "shadow-emerald-500/20",
  },
  degraded: {
    label: "Degraded Performance",
    color: "bg-yellow-500",
    text: "text-yellow-500",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500",
    bgSoft: "bg-yellow-500/10",
    icon: "●",
    glow: "shadow-yellow-500/20",
  },
  partial_outage: {
    label: "Partial Outage",
    color: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-500/30",
    bg: "bg-orange-500",
    bgSoft: "bg-orange-500/10",
    icon: "●",
    glow: "shadow-orange-500/20",
  },
  major_outage: {
    label: "Major Outage",
    color: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500/30",
    bg: "bg-red-500",
    bgSoft: "bg-red-500/10",
    icon: "●",
    glow: "shadow-red-500/20",
  },
  maintenance: {
    label: "Under Maintenance",
    color: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500/30",
    bg: "bg-blue-500",
    bgSoft: "bg-blue-500/10",
    icon: "●",
    glow: "shadow-blue-500/20",
  },
};

export const incidentImpactMeta: Record<IncidentImpact, { label: string; theme: StatusTheme }> = {
  none: { label: "None", theme: statusMeta.operational },
  minor: { label: "Minor", theme: statusMeta.degraded },
  major: { label: "Major", theme: statusMeta.partial_outage },
  critical: { label: "Critical", theme: statusMeta.major_outage },
};

export const incidentStatusMeta: Record<IncidentStatus, { label: string }> = {
  investigating: { label: "Investigating" },
  identified: { label: "Identified" },
  monitoring: { label: "Monitoring" },
  resolved: { label: "Resolved" },
};

export const maintenanceStatusMeta: Record<MaintenanceStatus, { label: string; theme: StatusTheme }> = {
  scheduled: { label: "Scheduled", theme: statusMeta.maintenance },
  in_progress: { label: "In Progress", theme: statusMeta.partial_outage },
  completed: { label: "Completed", theme: statusMeta.operational },
  cancelled: { label: "Cancelled", theme: statusMeta.degraded },
};

export function overallStatus(
  statuses: ComponentStatus[]
): { status: ComponentStatus; label: string } {
  if (statuses.length === 0) return { status: "operational", label: "No Components" };
  const order: ComponentStatus[] = [
    "major_outage",
    "partial_outage",
    "maintenance",
    "degraded",
    "operational",
  ];
  for (const s of order) {
    if (statuses.includes(s)) {
      return { status: s, label: statusMeta[s].label };
    }
  }
  return { status: "operational", label: statusMeta.operational.label };
}

export function statusLabel(status: ComponentStatus): string {
  return statusMeta[status]?.label ?? status;
}

export function statusColorClass(status: ComponentStatus): string {
  return statusMeta[status]?.color ?? "bg-gray-400";
}

export function statusTextClass(status: ComponentStatus): string {
  return statusMeta[status]?.text ?? "text-gray-400";
}

export function statusBorderClass(status: ComponentStatus): string {
  return statusMeta[status]?.border ?? "border-gray-500/30";
}

export function statusBgSoftClass(status: ComponentStatus): string {
  return statusMeta[status]?.bgSoft ?? "bg-gray-500/10";
}

export function statusGlowClass(status: ComponentStatus): string {
  return statusMeta[status]?.glow ?? "shadow-gray-500/20";
}

export function statusIcon(status: ComponentStatus): string {
  return statusMeta[status]?.icon ?? "●";
}

export function uptimePercentage(results: { status: string; checkedAt: Date }[]): number {
  if (results.length === 0) return 100;
  const up = results.filter((r) => r.status === "up").length;
  return Math.round((up / results.length) * 10000) / 100;
}

export function incidentImpactTheme(impact: IncidentImpact): StatusTheme {
  return incidentImpactMeta[impact]?.theme ?? statusMeta.operational;
}

export function incidentStatusLabel(status: IncidentStatus): string {
  return incidentStatusMeta[status]?.label ?? status;
}

export function maintenanceStatusTheme(status: MaintenanceStatus): StatusTheme {
  return maintenanceStatusMeta[status]?.theme ?? statusMeta.maintenance;
}

export function maintenanceStatusLabel(status: MaintenanceStatus): string {
  return maintenanceStatusMeta[status]?.label ?? status;
}
