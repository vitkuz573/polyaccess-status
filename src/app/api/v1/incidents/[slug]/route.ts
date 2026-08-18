import { NextRequest, NextResponse } from "next/server";
import { getStatusPageBySlug, getIncidentHistory } from "@/lib/queries";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  const { slug } = await params;
  const page = await getStatusPageBySlug(slug);
  if (!page || !page.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const active = page.incidents.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    status: i.status,
    impact: i.impact,
    started_at: i.startedAt,
    resolved_at: i.resolvedAt,
    updates: i.updates.map((u) => ({
      id: u.id,
      status: u.status,
      message: u.message,
      created_at: u.createdAt,
    })),
  }));

  const history = (await getIncidentHistory(page.id)).map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    status: i.status,
    impact: i.impact,
    started_at: i.startedAt,
    resolved_at: i.resolvedAt,
    updates: i.updates.map((u) => ({
      id: u.id,
      status: u.status,
      message: u.message,
      created_at: u.createdAt,
    })),
  }));

  return NextResponse.json({ active, history });
}
