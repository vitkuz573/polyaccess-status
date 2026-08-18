"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="h-4 w-4 text-[var(--sp-emerald)]" />,
        info: <InfoIcon className="h-4 w-4 text-[var(--sp-blue)]" />,
        warning: <TriangleAlertIcon className="h-4 w-4 text-[var(--sp-yellow)]" />,
        error: <OctagonXIcon className="h-4 w-4 text-[var(--sp-red)]" />,
        loading: <Loader2Icon className="h-4 w-4 animate-spin text-[var(--sp-blue)]" />,
      }}
      style={
        {
          "--normal-bg": "#0b1021",
          "--normal-text": "#f8fafc",
          "--normal-border": "rgba(255,255,255,0.12)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "bg-[#0b1021] text-[var(--sp-text)] border border-[var(--sp-border-strong)] shadow-[0_8px_30px_rgb(0,0,0,0.45)] rounded-xl px-4 py-3",
          description: "text-[var(--sp-text-secondary)]",
          actionButton: "bg-[var(--sp-emerald)] text-[#020617]",
          cancelButton: "bg-[var(--sp-surface)] text-[var(--sp-text-secondary)]",
          closeButton: "text-[var(--sp-text-tertiary)] hover:text-[var(--sp-text)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
