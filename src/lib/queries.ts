import { prisma } from "./db";

export async function getPublicStatusPages() {
  return prisma.statusPage.findMany({
    where: { isPublic: true },
    include: {
      organization: true,
      components: {
        orderBy: { position: "asc" },
        include: {
          checks: {
            include: {
              results: {
                orderBy: { checkedAt: "desc" },
                take: 100,
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getStatusPageBySlug(slug: string) {
  return prisma.statusPage.findUnique({
    where: { slug },
    include: {
      organization: true,
      components: {
        orderBy: [{ group: { position: "asc" } }, { position: "asc" }],
        include: {
          group: true,
          checks: {
            include: {
              results: {
                orderBy: { checkedAt: "desc" },
                take: 100,
              },
            },
          },
        },
      },
      incidents: {
        where: { resolvedAt: null },
        orderBy: { startedAt: "desc" },
        include: {
          updates: { orderBy: { createdAt: "desc" } },
          components: { include: { component: true } },
        },
      },
      maintenances: {
        where: { status: { in: ["scheduled", "in_progress"] } },
        orderBy: { startsAt: "desc" },
        include: { components: { include: { component: true } } },
      },
    },
  });
}

export async function getIncidentHistory(statusPageId: string) {
  return prisma.incident.findMany({
    where: { statusPageId, resolvedAt: { not: null } },
    orderBy: { resolvedAt: "desc" },
    take: 20,
    include: {
      updates: { orderBy: { createdAt: "desc" } },
      components: { include: { component: true } },
    },
  });
}
