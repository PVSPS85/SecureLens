import React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "low" | "medium" | "high" | "critical" | "outline"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    low: "bg-[#D1FAE5] text-[#047857]",
    medium: "bg-[#FEF3C7] text-[#B45309]",
    high: "bg-[#FFEDD5] text-[#C2410C]",
    critical: "bg-[#FEE2E2] text-[#B91C1C]",
    outline: "border border-border text-foreground",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
