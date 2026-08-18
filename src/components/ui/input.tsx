import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--sp-text)] ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--sp-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sp-emerald)]/30 focus-visible:border-[var(--sp-emerald)]/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
