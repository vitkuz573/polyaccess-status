import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComponentStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { uptimePercentage } from "@/lib/status";
import { formatDistanceToNow } from "date-fns";
import { RunChecksButton } from "./run-checks-button";
import { ServerIcon, CheckCircle2Icon, AlertCircleIcon, ActivityIcon } from "lucide-react";

export default async function AdminComponentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const components = await prisma.component.findMany({
    where: { statusPage: { organizationId: admin.organizationId } },
    include: {
      group: true,
      checks: {
        include: {
          results: { orderBy: { checkedAt: "desc" }, take: 100 },
        },
      },
    },
    orderBy: [{ group: { position: "asc" } }, { position: "asc" }],
  });

  const grouped = components.reduce<Record<string, typeof components>>((acc, c) => {
    const key = c.group?.name ?? "Ungrouped";
    acc[key] = acc[key] ?? [];
    acc[key].push(c);
    return acc;
  }, {});

  const totalChecks = components.reduce(
    (sum, c) => sum + c.checks.reduce((s, ch) => s + ch.results.length, 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--sp-text)]">
            Components
          </h1>
          <p className="text-sm text-[var(--sp-text-secondary)]">
            Monitor and manage your services
          </p>
        </div>
        <RunChecksButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <ServerIcon className="h-4 w-4" />
              Total components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[var(--sp-text)]">{components.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <ActivityIcon className="h-4 w-4" />
              Total checks run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[var(--sp-text)]">{totalChecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
              <CheckCircle2Icon className="h-4 w-4" />
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[var(--sp-text)]">
              {components.filter((c) => c.status === "operational").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ServerIcon}
              title="No components yet"
              description="Components will appear here once added to your status page."
            />
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-[var(--sp-text)]">{groupName}</CardTitle>
              <CardDescription className="text-[var(--sp-text-tertiary)]">
                {items.length} component{items.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Last checked</TableHead>
                      <TableHead>Latest result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((c) => {
                      const allResults = c.checks.flatMap((ch) => ch.results);
                      const latestResult = allResults[0];
                      const uptime = uptimePercentage(allResults);

                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-medium text-[var(--sp-text)]">{c.name}</div>
                            {c.description && (
                              <div className="text-xs text-[var(--sp-text-tertiary)]">
                                {c.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <ComponentStatusBadge status={c.status} />
                          </TableCell>
                          <TableCell className="tabular-nums text-[var(--sp-text)]">
                            {uptime.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-[var(--sp-text-secondary)]">
                            {latestResult ? (
                              formatDistanceToNow(latestResult.checkedAt) + " ago"
                            ) : (
                              <span className="text-[var(--sp-text-tertiary)]">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {latestResult ? (
                              <div className="flex items-center gap-2 text-sm text-[var(--sp-text)]">
                                {latestResult.status === "up" ? (
                                  <CheckCircle2Icon className="h-4 w-4 text-[var(--sp-emerald)]" />
                                ) : (
                                  <AlertCircleIcon className="h-4 w-4 text-[var(--sp-red)]" />
                                )}
                                <span className="capitalize">{latestResult.status}</span>
                                {latestResult.responseTime != null && (
                                  <span className="text-xs text-[var(--sp-text-tertiary)]">
                                    {latestResult.responseTime} ms
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--sp-text-tertiary)]">
                                No results
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
