import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { overallStatus, statusLabel, uptimePercentage } from "@/lib/status";
import { ComponentStatus } from "@prisma/client";
import { StatusDot } from "@/components/status/status-dot";
import { formatDistanceToNow } from "date-fns";
import {
  LayersIcon,
  AlertTriangleIcon,
  WrenchIcon,
  UsersIcon,
  ArrowRightIcon,
  ActivityIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const statusPage = await prisma.statusPage.findFirst({
    where: { organizationId: admin.organizationId },
    select: { id: true, name: true },
  });

  const statusPageId = statusPage?.id;

  const [components, activeIncidents, scheduledMaintenance, subscribers, auditLogs] =
    await Promise.all([
      prisma.component.count({
        where: { statusPage: { organizationId: admin.organizationId } },
      }),
      prisma.incident.count({
        where: {
          statusPage: { organizationId: admin.organizationId },
          resolvedAt: null,
        },
      }),
      prisma.maintenance.count({
        where: {
          statusPage: { organizationId: admin.organizationId },
          status: { in: ["scheduled", "in_progress"] },
        },
      }),
      prisma.subscriber.count({
        where: {
          statusPage: { organizationId: admin.organizationId },
          active: true,
        },
      }),
      prisma.auditLog.findMany({
        where: { organizationId: admin.organizationId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  let overall = { status: "operational" as ComponentStatus, label: "No Components" };
  let lastCheckedAt: Date | undefined;
  let overallUptime = 100;

  if (statusPageId) {
    const componentList = await prisma.component.findMany({
      where: { statusPageId },
      select: { status: true },
    });
    overall = overallStatus(componentList.map((c) => c.status));

    const latestResult = await prisma.checkResult.findFirst({
      where: { check: { component: { statusPageId } } },
      orderBy: { checkedAt: "desc" },
      select: { checkedAt: true },
    });
    lastCheckedAt = latestResult?.checkedAt;

    const results = await prisma.checkResult.findMany({
      where: { check: { component: { statusPageId } } },
      orderBy: { checkedAt: "desc" },
      take: 1000,
      select: { status: true, checkedAt: true },
    });
    overallUptime = uptimePercentage(results);
  }

  const quickLinks = [
    { href: "/admin/components", label: "Components", icon: LayersIcon, description: "Manage services" },
    { href: "/admin/incidents", label: "Incidents", icon: AlertTriangleIcon, description: "Track issues" },
    { href: "/admin/maintenance", label: "Maintenance", icon: WrenchIcon, description: "Schedule windows" },
  ];

  const statusGlow: Record<string, string> = {
    operational: "status-glow-emerald",
    degraded: "status-glow-yellow",
    partial_outage: "status-glow-orange",
    major_outage: "status-glow-red",
    maintenance: "status-glow-blue",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--sp-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--sp-text-secondary)]">
          Overview of {statusPage?.name ?? "your status page"}
        </p>
      </div>

      <div
        className={`status-glass-strong relative overflow-hidden rounded-2xl border border-[var(--sp-border-strong)] p-6 sm:p-8 ${statusGlow[overall.status]}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <StatusDot status={overall.status} size="lg" pulse />
            <div>
              <div className="text-sm font-medium text-[var(--sp-text-secondary)]">
                Overall system status
              </div>
              <div className="text-2xl font-semibold text-[var(--sp-text)]">
                {overall.label === "No Components" ? "All systems operational" : statusLabel(overall.status)}
              </div>
              {lastCheckedAt && (
                <div className="mt-0.5 text-xs text-[var(--sp-text-tertiary)]">
                  Last check {formatDistanceToNow(lastCheckedAt)} ago
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-semibold tabular-nums text-[var(--sp-text)]">
                {overallUptime.toFixed(2)}%
              </div>
              <div className="text-xs text-[var(--sp-text-tertiary)]">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold tabular-nums text-[var(--sp-text)]">
                {components}
              </div>
              <div className="text-xs text-[var(--sp-text-tertiary)]">Components</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <LayersIcon className="h-4 w-4" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
              {components}
            </div>
          </CardContent>
        </Card>

        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <AlertTriangleIcon className="h-4 w-4" />
              Active Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
              {activeIncidents}
            </div>
          </CardContent>
        </Card>

        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <WrenchIcon className="h-4 w-4" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
              {scheduledMaintenance}
            </div>
          </CardContent>
        </Card>

        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <UsersIcon className="h-4 w-4" />
              Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
              {subscribers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--sp-text)]">
              <ActivityIcon className="h-4 w-4 text-[var(--sp-emerald)]" />
              Recent activity
            </CardTitle>
            <CardDescription className="text-[var(--sp-text-tertiary)]">
              Latest actions across your status page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border)] py-10 text-center">
                <ClockIcon className="h-8 w-8 text-[var(--sp-text-tertiary)]" />
                <p className="mt-3 text-sm text-[var(--sp-text-secondary)]">No recent activity</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--sp-border)] bg-[rgba(255,255,255,0.02)] p-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--sp-emerald-soft)]">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-[var(--sp-emerald)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--sp-text)]">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-[var(--sp-text-tertiary)]">
                        {log.entity}
                        {log.actorEmail && (
                          <span className="ml-1">by {log.actorEmail}</span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--sp-text-tertiary)]">
                      {formatDistanceToNow(log.createdAt)} ago
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
          <CardHeader>
            <CardTitle className="text-[var(--sp-text)]">Quick actions</CardTitle>
            <CardDescription className="text-[var(--sp-text-tertiary)]">
              Navigate to management pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="block">
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-between border border-[var(--sp-border)] bg-[rgba(255,255,255,0.02)] py-3 text-left text-[var(--sp-text)] hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[var(--sp-text-secondary)]" />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs font-normal text-[var(--sp-text-tertiary)]">
                          {item.description}
                        </span>
                      </span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-[var(--sp-text-tertiary)]" />
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
