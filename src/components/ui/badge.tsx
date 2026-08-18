import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--sp-emerald)] text-[#020617] hover:bg-[var(--sp-emerald)]/80",
        secondary:
          "border-transparent bg-[var(--sp-surface)] text-[var(--sp-text)] hover:bg-[var(--sp-surface-hover)]",
        destructive:
          "border-transparent bg-[var(--sp-red)] text-white hover:bg-[var(--sp-red)]/80",
        outline: "border-[var(--sp-border-strong)] text-[var(--sp-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
