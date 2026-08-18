import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./components/logout-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboardIcon,
  LayersIcon,
  AlertTriangleIcon,
  WrenchIcon,
  MenuIcon,
  ActivityIcon,
  LogOutIcon,
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

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <ActivityIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">PolyAccess</div>
          <div className="text-xs text-muted-foreground">Status Admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <SheetClose asChild key={l.href}>
              <Link href={l.href} className="block">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Button>
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <div className="shrink-0 border-t p-4">
        <LogoutButton variant="ghost" className="w-full justify-start gap-3">
          Sign out
        </LogoutButton>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r bg-card lg:flex">
        {SidebarContent}
      </aside>

      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin navigation</SheetTitle>
                </SheetHeader>
                {SidebarContent}
              </SheetContent>
            </Sheet>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {organization?.name ?? "Organization"}
              </h2>
              <p className="text-xs text-muted-foreground">Admin dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-primary/10 p-0 text-xs font-semibold text-primary ring-1 ring-primary/20">
                  {admin.email.charAt(0).toUpperCase()}
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{admin.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {organization?.name ?? "Organization"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/components" className="cursor-pointer">
                    <LayersIcon className="mr-2 h-4 w-4" />
                    Components
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/incidents" className="cursor-pointer">
                    <AlertTriangleIcon className="mr-2 h-4 w-4" />
                    Incidents
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/maintenance" className="cursor-pointer">
                    <WrenchIcon className="mr-2 h-4 w-4" />
                    Maintenance
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" asChild>
                  <LogoutButton variant="ghost" className="w-full justify-start">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Sign out
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
