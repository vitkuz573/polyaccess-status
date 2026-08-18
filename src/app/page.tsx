import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicStatusPages } from "@/lib/queries";
import { overallStatus, uptimePercentage } from "@/lib/status";
import { StatusDot, StatusPageHeader, StatusPageFooter } from "@/components/status";

export const revalidate = 10;
export const dynamic = "force-dynamic";

export default async function Home() {
  const pages = await getPublicStatusPages();

  if (pages.length === 1) {
    const slug = pages[0].slug;
    return (
      <div className="status-dark status-aurora flex min-h-screen flex-col items-center justify-center text-center">
        <title>PolyAccess Status</title>
        <meta httpEquiv="refresh" content={`0;url=/${slug}`} />
        <p className="text-[var(--sp-text-secondary)]">
          Redirecting to <Link href={`/${slug}`} className="text-[var(--sp-text)] underline">status page</Link>...
        </p>
      </div>
    );
  }

  const pagesWithStatus = pages.map((page) => {
    const statuses = page.components.map((c) => c.status);
    const overall = overallStatus(statuses);
    const results = page.components.flatMap((c) =>
      c.checks.flatMap((ch) => ch.results)
    );
    const uptime = uptimePercentage(results);
    return { page, overall, uptime };
  });

  return (
    <div className="status-dark status-aurora flex min-h-screen flex-col">
      <StatusPageHeader title="PolyAccess Status" />

      <main className="relative z-10 flex-1">
        <section className="px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-[var(--sp-text)] sm:text-6xl">
              PolyAccess Status
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--sp-text-secondary)]">
              Real-time system status and incident updates for the PolyAccess
              ecosystem.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-24">
          {pagesWithStatus.length === 0 ? (
            <div className="status-glass rounded-2xl p-12 text-center">
              <p className="text-lg font-medium text-[var(--sp-text)]">
                No public status pages
              </p>
              <p className="mt-2 text-[var(--sp-text-secondary)]">
                There are no public status pages available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pagesWithStatus.map(({ page, overall, uptime }) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="group status-glass status-surface-hover status-border rounded-2xl p-6 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-[var(--sp-text)]">
                        {page.name}
                      </h2>
                      {page.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--sp-text-secondary)]">
                          {page.description}
                        </p>
                      )}
                    </div>
                    <StatusDot status={overall.status} size="md" pulse />
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[var(--sp-border)] pt-4">
                    <span className="text-sm font-medium text-[var(--sp-text-secondary)]">
                      {uptime.toFixed(2)}% uptime
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--sp-text)] group-hover:text-[var(--sp-text-secondary)] transition-colors">
                      View status
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <p className="text-sm text-[var(--sp-text-secondary)]">
              Looking for admin access?{" "}
              <Link
                href="/admin"
                className="font-medium text-[var(--sp-text)] underline underline-offset-4 transition-colors hover:text-[var(--sp-text-secondary)]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>

      <StatusPageFooter />
    </div>
  );
}
