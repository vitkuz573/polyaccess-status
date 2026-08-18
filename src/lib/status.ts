import { ComponentStatus } from "@prisma/client";

export const statusMeta: Record<
  ComponentStatus,
  { label: string; color: string; icon: string }
> = {
  operational: { label: "Operational", color: "bg-emerald-500", icon: "●" },
  degraded: { label: "Degraded Performance", color: "bg-yellow-500", icon: "●" },
  partial_outage: { label: "Partial Outage", color: "bg-orange-500", icon: "●" },
  major_outage: { label: "Major Outage", color: "bg-red-500", icon: "●" },
  maintenance: { label: "Under Maintenance", color: "bg-blue-500", icon: "●" },
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

export function uptimePercentage(results: { status: string; checkedAt: Date }[]): number {
  if (results.length === 0) return 100;
  const up = results.filter((r) => r.status === "up").length;
  return Math.round((up / results.length) * 10000) / 100;
}
