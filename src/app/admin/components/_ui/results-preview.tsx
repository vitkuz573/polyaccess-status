"use client";

import { CheckResult } from "@prisma/client";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ResultsPreviewProps {
  results: CheckResult[];
}

export function ResultsPreview({ results }: ResultsPreviewProps) {
  if (!results.length) {
    return (
      <span className="text-xs text-[var(--sp-text-tertiary)]">No results</span>
    );
  }

  const latest = results[0];
  const recent = results.slice(0, 20);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {recent.map((result, index) => (
          <span
            key={`${result.id}-${index}`}
            className="block h-2 w-1 rounded-sm"
            style={{
              backgroundColor:
                result.status === "up"
                  ? "var(--sp-emerald)"
                  : result.status === "degraded"
                    ? "var(--sp-yellow)"
                    : "var(--sp-red)",
              opacity: 0.5 + (index / recent.length) * 0.5,
            }}
            title={`${result.status} — ${formatDistanceToNow(result.checkedAt)} ago`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-[var(--sp-text)]">
        {latest.status === "up" ? (
          <CheckCircle2Icon className="h-4 w-4 text-[var(--sp-emerald)]" />
        ) : (
          <AlertCircleIcon className="h-4 w-4 text-[var(--sp-red)]" />
        )}
        <span className="capitalize">{latest.status}</span>
        {latest.responseTime != null && (
          <span className="text-xs text-[var(--sp-text-tertiary)]">
            {latest.responseTime} ms
          </span>
        )}
      </div>
    </div>
  );
}

export function LatestResultCell({ results }: { results: CheckResult[] }) {
  if (!results.length) {
    return (
      <span className="text-xs text-[var(--sp-text-tertiary)]">No results</span>
    );
  }

  const latest = results[0];

  return (
    <div className="flex items-center gap-2 text-sm text-[var(--sp-text)]">
      {latest.status === "up" ? (
        <CheckCircle2Icon className="h-4 w-4 text-[var(--sp-emerald)]" />
      ) : (
        <AlertCircleIcon className="h-4 w-4 text-[var(--sp-red)]" />
      )}
      <span className="capitalize">{latest.status}</span>
      {latest.responseTime != null && (
        <span className="text-xs text-[var(--sp-text-tertiary)]">
          {latest.responseTime} ms
        </span>
      )}
    </div>
  );
}
