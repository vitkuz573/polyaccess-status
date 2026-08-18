import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  statusPageFormSchema,
  type StatusPageFormInput,
} from "@/lib/status-page-schema";

async function authorizeStatusPage(id: string, adminOrgId: string) {
  return prisma.statusPage.findFirst({
    where: { id, organizationId: adminOrgId },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await authorizeStatusPage(id, admin.organizationId);
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as StatusPageFormInput;
  const parsed = statusPageFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.slug !== page.slug) {
    const existingBySlug = await prisma.statusPage.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existingBySlug) {
      return NextResponse.json(
        { error: "A status page with this slug already exists" },
        { status: 409 }
      );
    }
  }

  const normalizedDomain = data.customDomain?.trim() || null;
  if (normalizedDomain && normalizedDomain !== page.customDomain) {
    const existingByDomain = await prisma.statusPage.findUnique({
      where: { customDomain: normalizedDomain },
      select: { id: true },
    });
    if (existingByDomain && existingByDomain.id !== page.id) {
      return NextResponse.json(
        { error: "A status page with this domain already exists" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.statusPage.update({
    where: { id: page.id },
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || null,
      customDomain: normalizedDomain,
      isPublic: data.isPublic,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "page_update",
      entity: "StatusPage",
      entityId: updated.id,
      actorEmail: admin.email,
      organizationId: admin.organizationId,
      metadata: { name: updated.name, slug: updated.slug },
    },
  });

  return NextResponse.json({ page: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  void request;
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await authorizeStatusPage(id, admin.organizationId);
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.statusPage.delete({ where: { id: page.id } });

  await prisma.auditLog.create({
    data: {
      action: "page_update",
      entity: "StatusPage",
      entityId: page.id,
      actorEmail: admin.email,
      organizationId: admin.organizationId,
      metadata: { name: page.name, slug: page.slug },
    },
  });

  return NextResponse.json({ ok: true });
}
