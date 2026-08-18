import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ComponentsClient } from "./_ui/components-client";

export default async function AdminComponentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const statusPage = await prisma.statusPage.findFirst({
    where: { organizationId: admin.organizationId },
    select: { id: true },
  });

  const [components, groups] = await Promise.all([
    prisma.component.findMany({
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
    }),
    statusPage
      ? prisma.componentGroup.findMany({
          where: { statusPageId: statusPage.id },
          orderBy: { position: "asc" },
          select: { id: true, name: true, position: true },
        })
      : [],
  ]);

  return <ComponentsClient initialComponents={components} groups={groups} />;
}
