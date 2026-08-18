import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [components, activeIncidents, scheduledMaintenance, subscribers] = await Promise.all([
    prisma.component.count({ where: { statusPage: { organizationId: admin.organizationId } } }),
    prisma.incident.count({ where: { statusPage: { organizationId: admin.organizationId }, resolvedAt: null } }),
    prisma.maintenance.count({
      where: { statusPage: { organizationId: admin.organizationId }, status: { in: ["scheduled", "in_progress"] } },
    }),
    prisma.subscriber.count({ where: { statusPage: { organizationId: admin.organizationId }, active: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{components}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeIncidents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scheduledMaintenance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscribers}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
