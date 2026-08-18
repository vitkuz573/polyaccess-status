import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./components/logout-button";
import {
  LayoutDashboardIcon,
  LayersIcon,
  AlertTriangleIcon,
  WrenchIcon,
  MenuIcon,
  XIcon,
  ActivityIcon,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/components", label: "Components", icon: LayersIcon },
  { href: "/admin/incidents", label: "Incidents", icon: AlertTriangleIcon },
  { href: "/admin/maintenance", label: "Maintenance", icon: WrenchIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: admin.organizationId },
    select: { name: true },
  });

  return (
    <div className="status-dark flex h-screen overflow-hidden bg-[#020617]">
      <input type="checkbox" id="admin-sidebar-toggle" className="peer sr-only" />

      <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 -translate-x-full flex-col border-r border-[var(--sp-border)] bg-[#0b1021] transition-transform duration-200 peer-checked:translate-x-0 lg:static lg:translate-x-0">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--sp-border)] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sp-emerald-soft)] ring-1 ring-[var(--sp-emerald)]/20">
            <ActivityIcon className="h-5 w-5 text-[var(--sp-emerald)]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--sp-text)]">PolyAccess</div>
            <div className="text-xs text-[var(--sp-text-tertiary)]">Status Admin</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-[var(--sp-text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--sp-text)]"
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--sp-border)] p-4">
          <LogoutButton
            variant="ghost"
            className="w-full justify-start gap-3 text-[var(--sp-text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--sp-text)]"
          >
            Sign out
          </LogoutButton>
        </div>
      </aside>

      <div className="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm peer-checked:block lg:hidden" />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--sp-border)] bg-[#020617]/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <label
              htmlFor="admin-sidebar-toggle"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--sp-border)] text-[var(--sp-text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--sp-text)] lg:hidden"
            >
              <MenuIcon className="h-5 w-5 peer-checked:hidden" />
              <XIcon className="hidden h-5 w-5 peer-checked:inline" />
            </label>
            <div>
              <h2 className="text-sm font-semibold text-[var(--sp-text)]">
                {organization?.name ?? "Organization"}
              </h2>
              <p className="text-xs text-[var(--sp-text-tertiary)]">Admin dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[200px] truncate text-sm text-[var(--sp-text-secondary)] sm:inline">
              {admin.email}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sp-emerald-soft)] text-xs font-semibold text-[var(--sp-emerald)] ring-1 ring-[var(--sp-emerald)]/20">
              {admin.email.charAt(0).toUpperCase()}
            </div>
            <LogoutButton
              variant="outline"
              className="border-[var(--sp-border)] bg-transparent text-[var(--sp-text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--sp-text)]"
            >
              Logout
            </LogoutButton>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
