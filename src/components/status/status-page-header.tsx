import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusPageHeaderProps {
  title?: string;
  href?: string;
  className?: string;
}

export function StatusPageHeader({
  title = "PolyAccess Status",
  href = "/",
  className,
}: StatusPageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--sp-border)] bg-[var(--sp-bg)]/80 px-4 py-3.5 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--sp-bg)]/60",
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-2">
        <Link
          href={href}
          className="group flex items-center gap-2 text-[var(--sp-text)] transition-opacity hover:opacity-80"
        >
          <Activity className="h-5 w-5 text-[var(--sp-emerald)]" />
          <span className="font-semibold tracking-tight">{title}</span>
        </Link>
      </div>
    </header>
  );
}
