import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { maintenanceStatusTheme, maintenanceStatusLabel } from "@/lib/status";
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
  if (!admin) redirect("/admin/login");

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
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--sp-text)]">
          Maintenance
        </h1>
        <p className="text-sm text-[var(--sp-text-secondary)]">
          Scheduled, in-progress, and completed maintenance windows
        </p>
      </div>

      <Card className="status-glass border-[var(--sp-border)] bg-[#0b1021]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--sp-text)]">
            <WrenchIcon className="h-5 w-5 text-[var(--sp-blue)]" />
            Scheduled / In progress
          </CardTitle>
          <CardDescription className="text-[var(--sp-text-tertiary)]">
            Upcoming and active maintenance windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border)] py-12 text-center">
              <CalendarIcon className="h-10 w-10 text-[var(--sp-text-tertiary)]" />
              <p className="mt-4 text-sm font-medium text-[var(--sp-text)]">
                No scheduled maintenance
              </p>
              <p className="mt-1 text-xs text-[var(--sp-text-tertiary)]">
                Maintenance windows will appear here once scheduled.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--sp-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--sp-text-tertiary)]">Title</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Status</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Starts</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Ends</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Affected components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((m) => {
                    const theme = maintenanceStatusTheme(m.status);
                    return (
                      <TableRow key={m.id} className="border-[var(--sp-border)]">
                        <TableCell>
                          <div className="font-medium text-[var(--sp-text)]">{m.title}</div>
                          {m.description && (
                            <div className="max-w-xs truncate text-xs text-[var(--sp-text-tertiary)]">
                              {m.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${theme.bgSoft} ${theme.text} ${theme.border}`}
                          >
                            {maintenanceStatusLabel(m.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-[var(--sp-text-secondary)]">
                          <div className="text-sm">{format(m.startsAt, "PP")}</div>
                          <div className="text-xs text-[var(--sp-text-tertiary)]">
                            {format(m.startsAt, "p")}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--sp-text-secondary)]">
                          {m.endsAt ? (
                            <>
                              <div className="text-sm">{format(m.endsAt, "PP")}</div>
                              <div className="text-xs text-[var(--sp-text-tertiary)]">
                                {format(m.endsAt, "p")}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {m.components.length === 0 ? (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {m.components.map((c) => (
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
            <CheckCircle2Icon className="h-5 w-5 text-[var(--sp-emerald)]" />
            Completed maintenance
          </CardTitle>
          <CardDescription className="text-[var(--sp-text-tertiary)]">
            Past maintenance windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sp-border)] py-12 text-center">
              <ClockIcon className="h-10 w-10 text-[var(--sp-text-tertiary)]" />
              <p className="mt-4 text-sm font-medium text-[var(--sp-text)]">No history</p>
              <p className="mt-1 text-xs text-[var(--sp-text-tertiary)]">
                Completed maintenance windows will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--sp-border)] hover:bg-transparent">
                    <TableHead className="text-[var(--sp-text-tertiary)]">Title</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Status</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Window</TableHead>
                    <TableHead className="text-[var(--sp-text-tertiary)]">Affected components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completed.map((m) => {
                    const theme = maintenanceStatusTheme(m.status);
                    return (
                      <TableRow key={m.id} className="border-[var(--sp-border)]">
                        <TableCell>
                          <div className="font-medium text-[var(--sp-text)]">{m.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-${theme.color.replace("bg-", "")} text-${theme.color.replace("bg-", "")}`}
                          >
                            {maintenanceStatusLabel(m.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[var(--sp-text-secondary)]">
                          <div className="text-sm">{format(m.startsAt, "PP")}</div>
                          <div className="text-xs text-[var(--sp-text-tertiary)]">
                            {m.endsAt
                              ? `${format(m.startsAt, "p")} – ${format(m.endsAt, "p")}`
                              : format(m.startsAt, "p")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {m.components.length === 0 ? (
                            <span className="text-xs text-[var(--sp-text-tertiary)]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {m.components.map((c) => (
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
