"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[var(--sp-emerald)]" />,
        info: <InfoIcon className="size-4 text-[var(--sp-blue)]" />,
        warning: <TriangleAlertIcon className="size-4 text-[var(--sp-yellow)]" />,
        error: <OctagonXIcon className="size-4 text-[var(--sp-red)]" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[var(--sp-blue)]" />,
      }}
      style={
        {
          "--normal-bg": "var(--sp-bg-elevated)",
          "--normal-text": "var(--sp-text)",
          "--normal-border": "var(--sp-border-strong)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:bg-[var(--sp-bg-elevated)] group-[.toaster]:text-[var(--sp-text)] group-[.toaster]:border-[var(--sp-border-strong)] group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.35)] group-[.toaster]:font-sans group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3",
          description: "group-[.toaster]:text-[var(--sp-text-secondary)]",
          actionButton: "group-[.toaster]:bg-[var(--sp-emerald)] group-[.toaster]:text-[#020617]",
          cancelButton: "group-[.toaster]:bg-[var(--sp-surface)] group-[.toaster]:text-[var(--sp-text-secondary)]",
          closeButton: "group-[.toaster]:text-[var(--sp-text-tertiary)] group-[.toaster]:hover:text-[var(--sp-text)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
