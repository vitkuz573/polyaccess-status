import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  incidentImpactTheme,
  incidentStatusLabel,
} from "@/lib/status";
import { StatusDot } from "@/components/status/status-dot";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  MessageSquareIcon,
  ServerIcon,
} from "lucide-react";

export default async function AdminIncidentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const [active, history] = await Promise.all([
    prisma.incident.findMany({
      where: { statusPage: { organizationId: admin.organizationId }, resolvedAt: null },
      orderBy: { startedAt: "desc" },
      include: {
        components: { include: { component: true } },
        updates: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.incident.findMany({
      where: { statusPage: { organizationId: admin.organizationId }, resolvedAt: { not: null } },
      orderBy: { resolvedAt: "desc" },
      take: 20,
      include: {
        components: { include: { component: true } },
        updates: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--sp-text)]">Incidents</h1>
        <p className="text-sm text-[var(--sp-text-secondary)]">
          Active issues and resolved incident history
        </p>
      </div>

      <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--sp-text)]">
            <AlertTriangleIcon className="h-5 w-5 text-[var(--sp-orange)]" />
            Active incidents
          </CardTitle>
          <CardDescription className="text-[var(--sp-text-tertiary)]">
            Ongoing issues that require attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border)] py-12 text-center">
              <CheckCircle2Icon className="h-10 w-10 text-[var(--sp-emerald)]" />
              <p className="mt-4 text-sm font-medium text-[var(--sp-text)]">All clear</p>
              <p className="mt-1 text-xs text-[var(--sp-text-tertiary)]">
                No active incidents at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--sp-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--sp-text-tertiary)]">Incident</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Status</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Impact</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Started</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Affected</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Latest update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((i) => {
                    const theme = incidentImpactTheme(i.impact);
                    return (
                      <TableRow key={i.id} className="border-[var(--sp-border)]">
                        <TableCell>
                          <div className="font-medium text-[var(--sp-text)]">{i.title}</div>
                          {i.description && (
                            <div className="max-w-xs truncate text-xs text-[var(--sp-text-tertiary)]">
                              {i.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${theme.bgSoft} ${theme.text} ${theme.border}`}
                          >
                            <StatusDot status={theme === incidentImpactTheme("none") ? "operational" : i.impact === "minor" ? "degraded" : i.impact === "major" ? "partial_outage" : "major_outage"} size="sm" />
                            {incidentStatusLabel(i.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-${theme.color.replace("bg-", "")} text-${theme.color.replace("bg-", "")}`}
                          >
                            {i.impact}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[var(--sp-text-secondary)]">
                          {formatDistanceToNow(i.startedAt)} ago
                        </TableCell>
                        <TableCell>
                          {i.components.length === 0 ? (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {i.components.map((c) => (
                                <span
                                  key={c.componentId}
                                  className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-[var(--sp-text-secondary)]"
                                >
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {i.updates[0] ? (
                            <div className="max-w-xs">
                              <p className="truncate text-sm text-[var(--sp-text)]">
                                {i.updates[0].message}
                              </p>
                              <p className="text-xs text-[var(--sp-text-tertiary)]">
                                {formatDistanceToNow(i.updates[0].createdAt)} ago
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">No updates</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--sp-text)]">
            <ClockIcon className="h-5 w-5 text-[var(--sp-text-secondary)]" />
            Incident history
          </CardTitle>
          <CardDescription className="text-[var(--sp-text-tertiary)]">
            Recently resolved incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border)] py-12 text-center">
              <MessageSquareIcon className="h-10 w-10 text-[var(--sp-text-tertiary)]" />
              <p className="mt-4 text-sm font-medium text-[var(--sp-text)]">No history</p>
              <p className="mt-1 text-xs text-[var(--sp-text-tertiary)]">
                Resolved incidents will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--sp-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--sp-text-tertiary)]">Title</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Impact</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Resolved</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Affected</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Latest update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((i) => {
                    return (
                      <TableRow key={i.id} className="border-[var(--sp-border)]">
                        <TableCell>
                          <div className="font-medium text-[var(--sp-text)]">{i.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[var(--sp-text-secondary)]">
                            {i.impact}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[var(--sp-text-secondary)]">
                          {i.resolvedAt ? format(i.resolvedAt, "PP") : "—"}
                        </TableCell>
                        <TableCell>
                          {i.components.length === 0 ? (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {i.components.map((c) => (
                                <span
                                  key={c.componentId}
                                  className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-[var(--sp-text-secondary)]"
                                >
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {i.updates[0] ? (
                            <div className="max-w-xs">
                              <p className="truncate text-sm text-[var(--sp-text)]">
                                {i.updates[0].message}
                              </p>
                              <p className="text-xs text-[var(--sp-text-tertiary)]">
                                {formatDistanceToNow(i.updates[0].createdAt)} ago
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">No updates</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
