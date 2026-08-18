import { prisma } from "../src/lib/db";
import { env } from "../src/lib/env";
import bcrypt from "bcryptjs";

const DEFAULT_ORG_SLUG = "polyaccess";
const DEFAULT_PAGE_SLUG = "polyaccess";
const DEFAULT_GROUP_ID = "00000000-0000-0000-0000-000000000001";
const COMPONENT_IDS = [
  "00000000-0000-0000-0000-000000000002",
  "00000000-0000-0000-0000-000000000003",
  "00000000-0000-0000-0000-000000000004",
];
const CHECK_IDS = [
  "00000000-0000-0000-0000-000000000005",
  "00000000-0000-0000-0000-000000000006",
  "00000000-0000-0000-0000-000000000007",
];

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: DEFAULT_ORG_SLUG },
    update: {},
    create: {
      name: "PolyAccess",
      slug: DEFAULT_ORG_SLUG,
    },
  });

  const hashedPassword = await bcrypt.hash("statusadmin123", 12);

  await prisma.statusPageUser.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: "admin@polyaccess.tech",
      },
    },
    update: { passwordHash: hashedPassword },
    create: {
      email: "admin@polyaccess.tech",
      passwordHash: hashedPassword,
      role: "admin",
      organizationId: org.id,
    },
  });

  const page = await prisma.statusPage.upsert({
    where: { slug: DEFAULT_PAGE_SLUG },
    update: {},
    create: {
      name: "PolyAccess Status",
      slug: DEFAULT_PAGE_SLUG,
      description: "Real-time status of PolyAccess products and services.",
      organizationId: org.id,
      isPublic: true,
    },
  });

  const group = await prisma.componentGroup.upsert({
    where: { id: DEFAULT_GROUP_ID },
    update: {},
    create: {
      id: DEFAULT_GROUP_ID,
      name: "Core Services",
      position: 0,
      statusPageId: page.id,
    },
  });

  const components = [
    {
      id: COMPONENT_IDS[0],
      name: "Challenge Proxy",
      description: "Anti-bot challenge resolution proxy.",
      checkId: CHECK_IDS[0],
      target: `${env.CHALLENGE_PROXY_URL}/health`,
    },
    {
      id: COMPONENT_IDS[1],
      name: "Key Service",
      description: "API key, customer, and billing management.",
      checkId: CHECK_IDS[1],
      target: `${env.KEY_SERVICE_URL}/health`,
    },
    {
      id: COMPONENT_IDS[2],
      name: "Portal",
      description: "Customer dashboard and account management.",
      checkId: CHECK_IDS[2],
      target: `${env.PORTAL_BASE_URL}/api/health`,
    },
  ];

  for (const [index, c] of components.entries()) {
    const component = await prisma.component.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        description: c.description,
        position: index,
        statusPageId: page.id,
        groupId: group.id,
      },
    });

    await prisma.check.upsert({
      where: { id: c.checkId },
      update: {
        target: c.target,
        type: "http",
      },
      create: {
        id: c.checkId,
        type: "http",
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
