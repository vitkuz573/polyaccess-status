import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusPageFooterProps {
  brandName?: string;
  className?: string;
}

export function StatusPageFooter({
  brandName = "PolyAccess",
  className,
}: StatusPageFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-[var(--sp-border)] bg-[var(--sp-bg-elevated)]/50 px-4 py-10 text-sm text-[var(--sp-text-secondary)]",
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--sp-emerald)]" />
          <span className="font-medium text-[var(--sp-text)]">
            {brandName} Status
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="transition-colors hover:text-[var(--sp-text)]"
          >
            All status pages
          </Link>
          <Link
            href="/admin"
            className="transition-colors hover:text-[var(--sp-text)]"
          >
            Admin
          </Link>
        </div>

        <p className="text-xs text-[var(--sp-text-tertiary)]">
          &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
