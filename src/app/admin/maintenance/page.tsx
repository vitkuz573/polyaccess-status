import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function AdminMaintenancePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const maintenances = await prisma.maintenance.findMany({
    where: { statusPage: { organizationId: admin.organizationId } },
    orderBy: { startsAt: "desc" },
    include: { components: { include: { component: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenances.length === 0 ? (
            <p className="text-muted-foreground">No maintenance scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Components</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.status}</Badge>
                    </TableCell>
                    <TableCell>{format(m.startsAt, "PP p")}</TableCell>
                    <TableCell>{m.endsAt ? format(m.endsAt, "PP p") : "—"}</TableCell>
                    <TableCell>{m.components.map((c) => c.component.name).join(", ")}</TableCell>
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
