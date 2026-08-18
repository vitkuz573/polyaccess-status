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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Incidents</h1>
        <p className="text-sm text-muted-foreground">
          Active issues and resolved incident history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangleIcon className="h-5 w-5 text-orange-400" />
            Active incidents
          </CardTitle>
          <CardDescription>
            Ongoing issues that require attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <EmptyState
              icon={CheckCircle2Icon}
              title="All clear"
              description="No active incidents at the moment."
              iconClassName="text-emerald-400"
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
                          <div className="font-medium text-foreground">{i.title}</div>
                          {i.description && (
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                              {i.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <IncidentStatusBadge impact={i.impact} statusLabel={i.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{i.impact}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(i.startedAt)} ago
                        </TableCell>
                        <TableCell>
                          {i.components.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {i.components.map((c) => (
                                <Badge key={c.componentId} variant="secondary" className="gap-1">
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {i.updates[0] ? (
                            <div className="max-w-xs">
                              <p className="truncate text-sm text-foreground">
                                {i.updates[0].message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(i.updates[0].createdAt)} ago
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No updates</span>
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
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            Incident history
          </CardTitle>
          <CardDescription>
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
                          <div className="font-medium text-foreground">{i.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{i.impact}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {i.resolvedAt ? format(i.resolvedAt, "PP") : "—"}
                        </TableCell>
                        <TableCell>
                          {i.components.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {i.components.map((c) => (
                                <Badge key={c.componentId} variant="secondary" className="gap-1">
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {i.updates[0] ? (
                            <div className="max-w-xs">
                              <p className="truncate text-sm text-foreground">
                                {i.updates[0].message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(i.updates[0].createdAt)} ago
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No updates</span>
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
