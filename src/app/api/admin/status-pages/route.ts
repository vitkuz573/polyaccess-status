import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  statusPageFormSchema,
  type StatusPageFormInput,
} from "@/lib/status-page-schema";

export async function GET(): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.statusPage.findMany({
    where: { organizationId: admin.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (data.customDomain) {
    const existingByDomain = await prisma.statusPage.findUnique({
      where: { customDomain: data.customDomain },
      select: { id: true },
    });
    if (existingByDomain) {
      return NextResponse.json(
        { error: "A status page with this domain already exists" },
        { status: 409 }
      );
    }
  }

  const page = await prisma.statusPage.create({
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || null,
      customDomain: data.customDomain?.trim() || null,
      isPublic: data.isPublic,
      organizationId: admin.organizationId,
    },
  });

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

  return NextResponse.json({ page }, { status: 201 });
}
