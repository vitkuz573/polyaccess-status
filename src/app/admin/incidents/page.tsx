import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";

export default async function AdminIncidentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [active, history] = await Promise.all([
    prisma.incident.findMany({
      where: { statusPage: { organizationId: admin.organizationId }, resolvedAt: null },
      orderBy: { startedAt: "desc" },
      include: { components: { include: { component: true } }, updates: true },
    }),
    prisma.incident.findMany({
      where: { statusPage: { organizationId: admin.organizationId }, resolvedAt: { not: null } },
      orderBy: { resolvedAt: "desc" },
      take: 20,
      include: { components: { include: { component: true } }, updates: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Incidents</h1>

      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-muted-foreground">No active incidents.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Components</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{i.impact}</Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(i.startedAt)} ago</TableCell>
                    <TableCell>{i.components.map((c) => c.component.name).join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground">No resolved incidents.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Updates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>{i.resolvedAt ? format(i.resolvedAt, "PP") : "—"}</TableCell>
                    <TableCell>{i.updates.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
