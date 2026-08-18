import { notFound } from "next/navigation";
import { getStatusPageBySlug, getIncidentHistory } from "@/lib/queries";
import { overallStatus, statusLabel, statusColorClass, uptimePercentage } from "@/lib/status";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const revalidate = 10;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StatusPage({ params }: Props) {
  const { slug } = await params;
  const page = await getStatusPageBySlug(slug);
  if (!page || !page.isPublic) notFound();

  const statuses = page.components.map((c) => c.status);
  const overall = overallStatus(statuses);

  const grouped = page.components.reduce<Record<string, typeof page.components>>((acc, c) => {
    const key = c.group?.name ?? "Services";
    acc[key] = acc[key] ?? [];
    acc[key].push(c);
    return acc;
  }, {});

  const history = await getIncidentHistory(page.id);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{page.name}</h1>
          {page.description && <p className="mt-2 text-muted-foreground">{page.description}</p>}
        </div>

        <Card className={`mb-8 border-l-8 ${statusColorClass(overall.status).replace("bg-", "border-l-")}`}>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <span className={`h-5 w-5 rounded-full ${statusColorClass(overall.status)}`} />
              <span className="text-2xl font-semibold">{overall.label}</span>
            </div>
          </CardContent>
        </Card>

        {page.incidents.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold">Active Incidents</h2>
            {page.incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{incident.impact}</Badge>
                    <span>Started {formatDistanceToNow(incident.startedAt)} ago</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>{incident.description}</p>
                  {incident.components.map((ic) => (
                    <Badge key={ic.componentId} variant="secondary">
                      {ic.component.name}
                    </Badge>
                  ))}
                  {incident.updates.map((u) => (
                    <div key={u.id} className="rounded-md bg-muted p-3 text-sm">
                      <div className="font-medium">{u.status}</div>
                      <div className="text-muted-foreground">{format(u.createdAt, "PPp")}</div>
                      <p className="mt-1">{u.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {page.maintenances.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold">Scheduled Maintenance</h2>
            {page.maintenances.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{m.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {format(m.startsAt, "PPp")} {m.endsAt && `— ${format(m.endsAt, "PPp")}`}
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mb-8 space-y-6">
          <h2 className="text-xl font-semibold">Components</h2>
          {Object.entries(grouped).map(([groupName, components]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-base font-medium text-muted-foreground">{groupName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {components.map((c) => {
                  const results = c.checks.flatMap((ch) => ch.results);
                  const uptime = uptimePercentage(results);
                  return (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        {c.description && <div className="text-sm text-muted-foreground">{c.description}</div>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{uptime.toFixed(2)}% uptime</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${statusColorClass(c.status)}`} />
                          <span className="text-sm font-medium">{statusLabel(c.status)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {history.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Incident History</h2>
            {history.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <CardTitle className="text-base">{incident.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Resolved {incident.resolvedAt ? formatDistanceToNow(incident.resolvedAt) : ""} ago
                  </div>
                </CardHeader>
                <CardContent>
                  {incident.updates.slice(0, 1).map((u) => (
                    <p key={u.id} className="text-sm text-muted-foreground">
                      {u.message}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator className="my-8" />
        <footer className="text-center text-sm text-muted-foreground">
          Powered by PolyAccess Status
        </footer>
      </div>
    </main>
  );
}
