import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { componentFormSchema, type ComponentFormInput } from "@/lib/component-schema";
import { ComponentStatus, CheckType } from "@prisma/client";

function getCheckType(value: string): CheckType {
  if (value === "http") return CheckType.http;
  return CheckType.http;
}

export async function GET(): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const components = await prisma.component.findMany({
    where: { statusPage: { organizationId: admin.organizationId } },
    include: {
      group: true,
      checks: {
        include: {
          results: { orderBy: { checkedAt: "desc" }, take: 100 },
        },
      },
    },
    orderBy: [{ group: { position: "asc" } }, { position: "asc" }],
  });

  return NextResponse.json({ components });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ComponentFormInput;
  const parsed = componentFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const statusPage = await prisma.statusPage.findFirst({
    where: { organizationId: admin.organizationId },
    select: { id: true },
  });
  if (!statusPage) {
    return NextResponse.json({ error: "Status page not found" }, { status: 404 });
  }

  const data = parsed.data;

  let groupId: string | null = data.groupId ?? null;
  if (data.newGroupName && data.newGroupName.trim()) {
    const existing = await prisma.componentGroup.findFirst({
      where: { statusPageId: statusPage.id, name: data.newGroupName.trim() },
    });
    if (existing) {
      groupId = existing.id;
    } else {
      const maxPositionGroup = await prisma.componentGroup.findFirst({
        where: { statusPageId: statusPage.id },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const createdGroup = await prisma.componentGroup.create({
        data: {
          name: data.newGroupName.trim(),
          statusPageId: statusPage.id,
          position: (maxPositionGroup?.position ?? -1) + 1,
        },
      });
      groupId = createdGroup.id;
    }
  }

  const status: ComponentStatus = data.statusOverride ?? "operational";

  const component = await prisma.component.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status,
      position: data.position ?? 0,
      statusPageId: statusPage.id,
      groupId,
      checks: {
        create: (data.checks ?? []).map((check) => ({
          type: getCheckType(check.type),
          target: check.target.trim(),
          interval: check.interval ?? 60,
          timeout: check.timeout ?? 10,
          enabled: check.enabled ?? true,
          regions: [],
        })),
      },
    },
    include: {
      group: true,
      checks: {
        include: {
          results: { orderBy: { checkedAt: "desc" }, take: 100 },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "component_create",
      entity: "Component",
      entityId: component.id,
      actorEmail: admin.email,
      organizationId: admin.organizationId,
      metadata: { name: component.name },
    },
  });

  return NextResponse.json({ component });
}
