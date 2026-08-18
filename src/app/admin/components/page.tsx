import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusLabel } from "@/lib/status";

export default async function AdminComponentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const components = await prisma.component.findMany({
    where: { statusPage: { organizationId: admin.organizationId } },
    include: { group: true, checks: true },
    orderBy: [{ group: { position: "asc" } }, { position: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Components</h1>
      <Card>
        <CardHeader>
          <CardTitle>Monitored Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.group?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "operational" ? "default" : "destructive"}>
                      {statusLabel(c.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.checks.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
