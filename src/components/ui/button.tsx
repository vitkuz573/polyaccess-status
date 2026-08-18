import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--sp-emerald)] text-[#020617] hover:bg-[var(--sp-emerald)]/90 focus-visible:ring-[var(--sp-emerald)]",
        destructive:
          "bg-[var(--sp-red)] text-white hover:bg-[var(--sp-red)]/90 focus-visible:ring-[var(--sp-red)]",
        outline:
          "border border-[var(--sp-border-strong)] bg-transparent text-[var(--sp-text)] hover:bg-[var(--sp-surface)] hover:text-[var(--sp-text-secondary)]",
        secondary:
          "bg-[var(--sp-surface)] text-[var(--sp-text)] hover:bg-[var(--sp-surface-hover)]",
        ghost:
          "text-[var(--sp-text-secondary)] hover:bg-[var(--sp-surface)] hover:text-[var(--sp-text)]",
        link: "text-[var(--sp-emerald)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
