import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MaintenanceStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import {
  WrenchIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ServerIcon,
  ClockIcon,
} from "lucide-react";

export default async function AdminMaintenancePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const maintenances = await prisma.maintenance.findMany({
    where: { statusPage: { organizationId: admin.organizationId } },
    orderBy: { startsAt: "desc" },
    include: { components: { include: { component: true } } },
  });

  const upcoming = maintenances.filter((m) => ["scheduled", "in_progress"].includes(m.status));
  const completed = maintenances.filter((m) => ["completed", "cancelled"].includes(m.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Maintenance
        </h1>
        <p className="text-sm text-muted-foreground">
          Scheduled, in-progress, and completed maintenance windows
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <WrenchIcon className="h-5 w-5 text-blue-400" />
            Scheduled / In progress
          </CardTitle>
          <CardDescription>
            Upcoming and active maintenance windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No scheduled maintenance"
              description="Maintenance windows will appear here once scheduled."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Starts</TableHead>
                    <TableHead>Ends</TableHead>
                    <TableHead>Affected components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((m) => {
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{m.title}</div>
                          {m.description && (
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                              {m.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <MaintenanceStatusBadge status={m.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="text-sm">{format(m.startsAt, "PP")}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(m.startsAt, "p")}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.endsAt ? (
                            <>
                              <div className="text-sm">{format(m.endsAt, "PP")}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(m.endsAt, "p")}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {m.components.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {m.components.map((c) => (
                                <Badge key={c.componentId} variant="secondary" className="gap-1">
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </Badge>
                              ))}
                            </div>
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
            <CheckCircle2Icon className="h-5 w-5 text-emerald-400" />
            Completed maintenance
          </CardTitle>
          <CardDescription>
            Past maintenance windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <EmptyState
              icon={ClockIcon}
              title="No history"
              description="Completed maintenance windows will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Affected components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completed.map((m) => {
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{m.title}</div>
                        </TableCell>
                        <TableCell>
                          <MaintenanceStatusBadge status={m.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="text-sm">{format(m.startsAt, "PP")}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.endsAt
                              ? `${format(m.startsAt, "p")} – ${format(m.endsAt, "p")}`
                              : format(m.startsAt, "p")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {m.components.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {m.components.map((c) => (
                                <Badge key={c.componentId} variant="secondary" className="gap-1">
                                  <ServerIcon className="h-3 w-3" />
                                  {c.component.name}
                                </Badge>
                              ))}
                            </div>
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
