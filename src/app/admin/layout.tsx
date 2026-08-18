import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/components", label: "Components" },
    { href: "/admin/incidents", label: "Incidents" },
    { href: "/admin/maintenance", label: "Maintenance" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8 text-lg font-bold">PolyAccess Status Admin</div>
        <nav className="space-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button variant="ghost" className="w-full justify-start">
                {l.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
