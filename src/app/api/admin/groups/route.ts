import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusPage = await prisma.statusPage.findFirst({
    where: { organizationId: admin.organizationId },
    select: { id: true },
  });

  const groups = statusPage
    ? await prisma.componentGroup.findMany({
        where: { statusPageId: statusPage.id },
        orderBy: { position: "asc" },
        select: { id: true, name: true, position: true },
      })
    : [];

  return NextResponse.json({ groups });
}
