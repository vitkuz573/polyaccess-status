import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusPagesClient } from "./_ui/status-pages-client";

export default async function AdminStatusPagesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const pages = await prisma.statusPage.findMany({
    where: { organizationId: admin.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return <StatusPagesClient initialPages={pages} />;
}
