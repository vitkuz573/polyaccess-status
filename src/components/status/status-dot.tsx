import { ComponentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { statusColorClass } from "@/lib/status";

type StatusDotStatus = ComponentStatus;

interface StatusDotProps {
  status: StatusDotStatus;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

const glowClasses: Record<ComponentStatus, string> = {
  operational: "status-dot-glow-emerald",
  degraded: "status-dot-glow-yellow",
  partial_outage: "status-dot-glow-orange",
  major_outage: "status-dot-glow-red",
  maintenance: "status-dot-glow-blue",
};

export function StatusDot({
  status,
  size = "sm",
  pulse = false,
  glow = true,
  className,
}: StatusDotProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      aria-hidden="true"
    >
      {pulse && (
        <span
          className={cn(
            "status-pulse absolute inline-flex rounded-full opacity-40",
            sizeClasses[size],
            statusColorClass(status)
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-block rounded-full",
          sizeClasses[size],
          statusColorClass(status),
          glow && glowClasses[status]
        )}
      />
    </span>
  );
}
