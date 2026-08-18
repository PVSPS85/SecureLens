import React, { useState } from "react"
import { Check, AlertTriangle, ShieldAlert, Play, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { timeline } from "./data"

const toneIcon = {
  info: { Icon: Play, cls: "text-primary bg-primary/10" },
  ok: { Icon: Check, cls: "text-risk-low-text bg-risk-low-bg" },
  warn: { Icon: AlertTriangle, cls: "text-risk-medium-text bg-risk-medium-bg" },
  bad: { Icon: ShieldAlert, cls: "text-risk-critical-text bg-risk-critical-bg" },
} as const

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function TimelineList() {
  return (
    <ol className="relative space-y-4 pl-2">
      <span className="absolute left-[15px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {timeline.map((item, i) => {
        const { Icon, cls } = toneIcon[item.tone]
        return (
          <li key={i}>
            <button
              onClick={() => scrollToSection(item.target)}
              className="group flex w-full items-start gap-3 text-left"
            >
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                  cls,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block font-mono text-[11px] text-muted-foreground">
                  {item.time}
                </span>
                <span className="block text-sm text-foreground group-hover:text-primary">
                  {item.label}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function Timeline() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Desktop: persistent secondary panel */}
      <div className="hidden lg:block">
        <div className="rounded-xl border border-border bg-card p-5 subtle-shadow">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Investigation Timeline
          </h3>
          <TimelineList />
        </div>
      </div>

      {/* Mobile/tablet: collapsible drawer-style card */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 subtle-shadow"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Investigation Timeline
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="mt-2 rounded-xl border border-border bg-card p-5 subtle-shadow">
            <TimelineList />
          </div>
        )}
      </div>
    </>
  )
}
