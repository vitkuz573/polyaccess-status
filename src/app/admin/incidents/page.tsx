import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IncidentStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
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

      <Card>
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
            <EmptyState
              icon={CheckCircle2Icon}
              title="All clear"
              description="No active incidents at the moment."
              iconClassName="text-[var(--sp-emerald)]"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Latest update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((i) => {
                    return (
                      <TableRow key={i.id}>
                        <TableCell>
                          <div className="font-medium text-[var(--sp-text)]">{i.title}</div>
                          {i.description && (
                            <div className="max-w-xs truncate text-xs text-[var(--sp-text-tertiary)]">
                              {i.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <IncidentStatusBadge impact={i.impact} statusLabel={i.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[var(--sp-text-secondary)]">
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
                            <div className="flex flex-wrap gap-1.5">
                              {i.components.map((c) => (
                                <span
                                  key={c.componentId}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--sp-border)] bg-[var(--sp-surface)] px-2.5 py-1 text-xs text-[var(--sp-text-secondary)]"
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

      <Card>
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
            <EmptyState
              icon={MessageSquareIcon}
              title="No history"
              description="Resolved incidents will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Latest update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((i) => {
                    return (
                      <TableRow key={i.id}>
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
                            <div className="flex flex-wrap gap-1.5">
                              {i.components.map((c) => (
                                <span
                                  key={c.componentId}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--sp-border)] bg-[var(--sp-surface)] px-2.5 py-1 text-xs text-[var(--sp-text-secondary)]"
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
