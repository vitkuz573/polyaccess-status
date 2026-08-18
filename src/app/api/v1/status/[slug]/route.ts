import { NextRequest, NextResponse } from "next/server";
import { getStatusPageBySlug } from "@/lib/queries";
import { overallStatus, uptimePercentage } from "@/lib/status";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  const { slug } = await params;
  const page = await getStatusPageBySlug(slug);
  if (!page || !page.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const overall = overallStatus(page.components.map((c) => c.status));
  const components = page.components.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    group: c.group?.name ?? null,
    uptime_90d: uptimePercentage(
      c.checks.flatMap((ch) => ch.results).filter((r) => r.checkedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    ),
  }));

  return NextResponse.json({
    page: {
      name: page.name,
      slug: page.slug,
      description: page.description,
    },
    overall: {
      status: overall.status,
      label: overall.label,
    },
    components,
    active_incidents: page.incidents.map((i) => ({
      id: i.id,
      title: i.title,
      status: i.status,
      impact: i.impact,
      started_at: i.startedAt,
    })),
    scheduled_maintenance: page.maintenances.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      starts_at: m.startsAt,
      ends_at: m.endsAt,
    })),
  });
}
