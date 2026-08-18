import { notFound } from "next/navigation";
import { getStatusPageBySlug, getIncidentHistory } from "@/lib/queries";
import { overallStatus, uptimePercentage } from "@/lib/status";
import {
  StatusBanner,
  StatusPageHeader,
  StatusPageFooter,
  ComponentGroupCard,
  IncidentCard,
  MaintenanceCard,
  IncidentHistoryCard,
} from "@/components/status";

export const revalidate = 10;
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StatusPage({ params }: Props) {
  const { slug } = await params;
  const page = await getStatusPageBySlug(slug);
  if (!page || !page.isPublic) notFound();

  const statuses = page.components.map((c) => c.status);
  const overall = overallStatus(statuses);

  const grouped = page.components.reduce<
    Record<string, typeof page.components>
  >((acc, c) => {
    const key = c.group?.name ?? "Services";
    acc[key] = acc[key] ?? [];
    acc[key].push(c);
    return acc;
  }, {});

  const history = await getIncidentHistory(page.id);

  const allResults = page.components.flatMap((c) =>
    c.checks.flatMap((ch) => ch.results)
  );
  const overallUptime = uptimePercentage(allResults);

  const lastUpdatedAt = allResults[0]?.checkedAt ?? page.updatedAt;

  return (
    <div className="status-dark status-aurora flex min-h-screen flex-col">
      <StatusPageHeader title={page.name} />

      <main className="relative z-10 flex-1 px-4 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--sp-text)] sm:text-4xl">
              {page.name}
            </h1>
            {page.description && (
              <p className="mx-auto max-w-2xl text-[var(--sp-text-secondary)]">
                {page.description}
              </p>
            )}
          </div>

          <StatusBanner status={overall.status} lastUpdatedAt={lastUpdatedAt} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="status-glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
                {page.components.length}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
                Components
              </div>
            </div>
            <div className="status-glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
                {overallUptime.toFixed(2)}%
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
                Overall Uptime
              </div>
            </div>
            <div className="status-glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-semibold tabular-nums text-[var(--sp-text)]">
                {page.incidents.length}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--sp-text-tertiary)]">
                Active Incidents
              </div>
            </div>
          </div>

          {page.incidents.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
                Active Incidents
              </h2>
              <div className="space-y-4">
                {page.incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </section>
          )}

          {page.maintenances.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
                Scheduled Maintenance
              </h2>
              <div className="space-y-4">
                {page.maintenances.map((maintenance) => (
                  <MaintenanceCard
                    key={maintenance.id}
                    maintenance={maintenance}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
                Components
              </h2>
              <span className="text-sm text-[var(--sp-text-tertiary)]">
                Uptime over last 100 checks
              </span>
            </div>
            <div className="space-y-6">
              {Object.entries(grouped).map(([groupName, components]) => (
                <ComponentGroupCard
                  key={groupName}
                  groupName={groupName}
                  components={components}
                />
              ))}
            </div>
          </section>

          {history.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
                Incident History
              </h2>
              <div className="space-y-3">
                {history.map((incident) => (
                  <IncidentHistoryCard key={incident.id} incident={incident} />
                ))}
              </div>
            </section>
          )}

          <section className="status-glass rounded-2xl p-6 text-center sm:p-8">
            <h3 className="text-base font-semibold text-[var(--sp-text)]">
              Stay in the loop
            </h3>
            <p className="mt-1 text-sm text-[var(--sp-text-secondary)]">
              Subscribe to receive incident and maintenance notifications.
              Subscription form coming soon.
            </p>
          </section>
        </div>
      </main>

      <StatusPageFooter brandName={page.organization.name} />
    </div>
  );
}
