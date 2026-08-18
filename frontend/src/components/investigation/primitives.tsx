import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "../ui/Card"
import type { CheckStatus } from "./data"
import { statusLabel } from "./data"

// Maps a check status to restrained, risk-reserved color styles.
const statusStyles: Record<CheckStatus, string> = {
  pass: "bg-risk-low-bg text-risk-low-text",
  warning: "bg-risk-medium-bg text-risk-medium-text",
  suspicious: "bg-risk-high-bg text-risk-high-text",
  high: "bg-risk-high-bg text-risk-high-text",
  critical: "bg-risk-critical-bg text-risk-critical-text",
  unavailable: "bg-secondary text-muted-foreground",
}

const statusDot: Record<CheckStatus, string> = {
  pass: "bg-risk-low",
  warning: "bg-risk-medium",
  suspicious: "bg-risk-high",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
  unavailable: "bg-muted-foreground/50",
}

export function StatusPill({
  status,
  className,
}: {
  status: CheckStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[status])} />
      {statusLabel[status]}
    </span>
  )
}

// A collapsible evidence section used throughout the check explorer.
export function EvidenceSection({
  id,
  title,
  status,
  description,
  defaultOpen = false,
  children,
}: {
  id: string
  title: string
  status: CheckStatus
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card id={id} className="scroll-mt-24 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <StatusPill status={status} />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {title}
            </h3>
            {description && (
              <p className="truncate text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border p-5 sm:p-6">{children}</div>
      )}
    </Card>
  )
}

// A simple label/value definition row grid.
export function DataGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode; mono?: boolean }[]
  columns?: 1 | 2 | 3
}) {
  const cols =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1"
  return (
    <dl className={cn("grid grid-cols-1 gap-x-8 gap-y-4", cols)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0"
        >
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-sm text-foreground",
              item.mono && "font-mono",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function SectionSubhead({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  )
}
