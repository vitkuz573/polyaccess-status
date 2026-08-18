import { prisma } from "../src/lib/db";
import { env } from "../src/lib/env";
import bcrypt from "bcryptjs";

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "polyaccess" },
    update: {},
    create: {
      name: "PolyAccess",
      slug: "polyaccess",
    },
  });

  const hashedPassword = await bcrypt.hash("statusadmin123", 12);

  await prisma.statusPageUser.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "admin@polyaccess.tech" } },
    update: { passwordHash: hashedPassword },
    create: {
      email: "admin@polyaccess.tech",
      passwordHash: hashedPassword,
      role: "admin",
      organizationId: org.id,
    },
  });

  const page = await prisma.statusPage.upsert({
    where: { slug: "polyaccess" },
    update: {},
    create: {
      name: "PolyAccess Status",
      slug: "polyaccess",
      description: "Real-time status of PolyAccess products and services.",
      organizationId: org.id,
    },
  });

  const group = await prisma.componentGroup.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Core Services",
      position: 0,
      statusPageId: page.id,
    },
  });

  const components = [
    {
      name: "Challenge Proxy",
      description: "Anti-bot challenge resolution proxy.",
      checkType: "challenge_proxy_health" as const,
      target: `${env.CHALLENGE_PROXY_URL}/health`,
    },
    {
      name: "Key Service",
      description: "API key, customer, and billing management.",
      checkType: "https" as const,
      target: `${env.KEY_SERVICE_URL}/v1/health`,
    },
    {
      name: "Customer Portal",
      description: "Customer dashboard and account management.",
      checkType: "https" as const,
      target: `${env.PORTAL_BASE_URL}/api/health`,
    },
  ];

  for (const [index, c] of components.entries()) {
    const component = await prisma.component.upsert({
      where: { id: `00000000-0000-0000-0000-00000000000${index + 2}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000000${index + 2}`,
        name: c.name,
        description: c.description,
        position: index,
        statusPageId: page.id,
        groupId: group.id,
      },
    });

    await prisma.check.upsert({
      where: { id: `00000000-0000-0000-0000-00000000000${index + 5}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000000${index + 5}`,
        type: c.checkType,
        target: c.target,
        interval: 60,
        timeout: 10,
        componentId: component.id,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded PolyAccess status page.");
  // eslint-disable-next-line no-console
  console.log(`Default admin: admin@polyaccess.tech / statusadmin123`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
