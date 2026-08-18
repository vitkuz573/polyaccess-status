import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { componentFormSchema, type ComponentFormInput } from "@/lib/component-schema";
import { ComponentStatus, CheckType } from "@prisma/client";

function getCheckType(value: string): CheckType {
  if (value === "http") return CheckType.http;
  return CheckType.http;
}

async function authorizeComponent(id: string, adminOrgId: string) {
  const component = await prisma.component.findFirst({
    where: { id, statusPage: { organizationId: adminOrgId } },
    include: {
      group: true,
      checks: {
        include: {
          results: { orderBy: { checkedAt: "desc" }, take: 100 },
        },
      },
    },
  });
  return component;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const component = await authorizeComponent(id, admin.organizationId);
  if (!component) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ component });
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
  const component = await authorizeComponent(id, admin.organizationId);
  if (!component) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as ComponentFormInput;
  const parsed = componentFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  let groupId: string | null = data.groupId ?? null;
  if (data.newGroupName && data.newGroupName.trim()) {
    const existing = await prisma.componentGroup.findFirst({
      where: { statusPageId: component.statusPageId, name: data.newGroupName.trim() },
    });
    if (existing) {
      groupId = existing.id;
    } else {
      const maxPositionGroup = await prisma.componentGroup.findFirst({
        where: { statusPageId: component.statusPageId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const createdGroup = await prisma.componentGroup.create({
        data: {
          name: data.newGroupName.trim(),
          statusPageId: component.statusPageId,
          position: (maxPositionGroup?.position ?? -1) + 1,
        },
      });
      groupId = createdGroup.id;
    }
  }

  const status: ComponentStatus = data.statusOverride ?? component.status;

  const existingCheckIds = new Set(
    (data.checks ?? []).filter((c) => c.id).map((c) => c.id as string)
  );
  const checksToDelete = component.checks.filter((c) => !existingCheckIds.has(c.id));

  await prisma.$transaction([
    prisma.checkResult.deleteMany({
      where: { checkId: { in: checksToDelete.map((c) => c.id) } },
    }),
    prisma.check.deleteMany({
      where: { id: { in: checksToDelete.map((c) => c.id) } },
    }),
  ]);

  for (const check of data.checks ?? []) {
    const checkData = {
      type: getCheckType(check.type),
      target: check.target.trim(),
      interval: check.interval ?? 60,
      timeout: check.timeout ?? 10,
      enabled: check.enabled ?? true,
      regions: [],
    };

    if (check.id) {
      await prisma.check.update({
        where: { id: check.id },
        data: checkData,
      });
    } else {
      await prisma.check.create({
        data: { ...checkData, componentId: component.id },
      });
    }
  }

  const updated = await prisma.component.update({
    where: { id: component.id },
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status,
      position: data.position ?? 0,
      groupId,
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
      action: "component_update",
      entity: "Component",
      entityId: updated.id,
      actorEmail: admin.email,
      organizationId: admin.organizationId,
      metadata: { name: updated.name },
    },
  });

  return NextResponse.json({ component: updated });
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
  const component = await authorizeComponent(id, admin.organizationId);
  if (!component) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.component.delete({ where: { id: component.id } });

  await prisma.auditLog.create({
    data: {
      action: "component_delete",
      entity: "Component",
      entityId: component.id,
      actorEmail: admin.email,
      organizationId: admin.organizationId,
      metadata: { name: component.name },
    },
  });

  return NextResponse.json({ ok: true });
}
