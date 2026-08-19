import React, { useState } from "react"
import { Check, AlertTriangle, ShieldAlert, Play, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const toneIcon = {
  info: { Icon: Play, cls: "text-primary bg-primary/10" },
  ok: { Icon: Check, cls: "text-risk-low-text bg-risk-low-bg" },
  warn: { Icon: AlertTriangle, cls: "text-risk-medium-text bg-risk-medium-bg" },
  bad: { Icon: ShieldAlert, cls: "text-risk-critical-text bg-risk-critical-bg" },
} as const

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export interface TimelineProps {
  completedAt?: string
  analyzers?: Record<string, any>
  findings?: any[]
  riskScore?: number
}

function buildDynamicTimeline({ completedAt, analyzers = {}, findings = [], riskScore = 0 }: TimelineProps) {
  const base = completedAt ? new Date(completedAt) : new Date()
  const formatSecOffset = (offsetSeconds: number) => {
    const d = new Date(base.getTime() - (10 - offsetSeconds) * 1000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  }

  const items: Array<{ time: string; label: string; target: string; tone: "info" | "ok" | "warn" | "bad" }> = [
    { time: formatSecOffset(0), label: "Investigation started", target: "overview", tone: "info" },
    { time: formatSecOffset(2), label: "Target normalization & URL parsed", target: "url", tone: "ok" },
  ]

  if (analyzers.dns) {
    const aCount = analyzers.dns?.data?.records?.a?.length || 1
    items.push({ time: formatSecOffset(3), label: `DNS resolved (${aCount} A record${aCount > 1 ? "s" : ""})`, target: "dns", tone: "ok" })
  }

  if (analyzers["ip-asn"]) {
    const ip = analyzers["ip-asn"]?.data?.ip || "Host"
    items.push({ time: formatSecOffset(4), label: `IP & ASN verified (${ip})`, target: "ip", tone: "ok" })
  }

  if (analyzers.tls) {
    const isOk = analyzers.tls?.data?.authorized !== false
    items.push({ time: formatSecOffset(5), label: `TLS handshake (${isOk ? "Valid" : "Untrusted"})`, target: "tls", tone: isOk ? "ok" : "warn" })
  }

  if (analyzers.http) {
    const secHeaders = analyzers.http?.data?.securityHeaders
    const hasIssues = secHeaders && (!secHeaders.hasHSTS || !secHeaders.hasCSP)
    items.push({ time: formatSecOffset(6), label: "HTTP security headers evaluated", target: "http", tone: hasIssues ? "warn" : "ok" })
  }

  if (analyzers.browser) {
    items.push({ time: formatSecOffset(7), label: "Playwright headless DOM extracted", target: "website", tone: "ok" })
  }

  if (analyzers.lookalike) {
    const isImp = analyzers.lookalike?.data?.potentialImpersonation
    items.push({ time: formatSecOffset(8), label: isImp ? "Brand impersonation risk detected" : "Brand collision check completed", target: "phishing", tone: isImp ? "bad" : "ok" })
  }

  items.push({
    time: formatSecOffset(9),
    label: `Rulebook risk score calculated (${riskScore}/100)`,
    target: "overview",
    tone: riskScore > 60 ? "bad" : riskScore > 30 ? "warn" : "ok"
  })

  items.push({
    time: formatSecOffset(10),
    label: "Forensic telemetry report compiled",
    target: "summary",
    tone: "ok"
  })

  return items
}

function TimelineList({ props }: { props: TimelineProps }) {
  const items = buildDynamicTimeline(props)

  return (
    <ol className="relative space-y-4 pl-2">
      <span className="absolute left-[15px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {items.map((item, i) => {
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

export function Timeline(props: TimelineProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Desktop: persistent secondary panel */}
      <div className="hidden lg:block">
        <div className="rounded-xl border border-border bg-card p-5 subtle-shadow">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Investigation Timeline
          </h3>
          <TimelineList props={props} />
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
            <TimelineList props={props} />
          </div>
        )}
      </div>
    </>
  )
}
