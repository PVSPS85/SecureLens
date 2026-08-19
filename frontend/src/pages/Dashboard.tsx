import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import {
  ShieldAlert, ShieldCheck, Globe, Activity, ArrowRight,
  Search, ChevronRight, X, CheckCircle2, Loader2,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { cn } from "../lib/utils"

import { 
  BRAND_DB, 
  RECENT_SCANS, 
  LOOKALIKE_DISCOVERY, 
  DASHBOARD_KPIS, 
  RiskLevel, 
  SearchResult 
} from "../lib/mockData"

type InputType  = "url" | "ip" | "domain" | "brand"

// ── Analysis steps ────────────────────────────────────────────────────────────

const ANALYSIS_STEPS = [
  "Investigation started",
  "Resolving target",
  "URL analysis",
  "DNS analysis",
  "IP / ASN analysis",
  "TLS analysis",
  "HTTP analysis",
  "Redirect analysis",
  "Threat intelligence",
  "Website analysis",
  "SecureAI analysis",
  "Risk score calculated",
  "Investigation complete",
]

// ── Brand database ────────────────────────────────────────────────────────────

function detectType(v: string): InputType {
  const t = v.trim()
  if (/^https?:\/\//i.test(t)) return "url"
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(t)) return "ip"
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-zA-Z]{2,})+$/i.test(t)) return "domain"
  return "brand"
}

function getBrandResults(query: string): SearchResult[] {
  const key = query.toLowerCase().trim()
  if (BRAND_DB[key]) return BRAND_DB[key]
  const cap = key.charAt(0).toUpperCase() + key.slice(1)
  return [
    { name: cap, domain: `${key}.com`, description: "Official website" },
    { name: `${cap} Support`, domain: `support.${key}.com`, description: "Support website" },
    { name: `${cap} Account`, domain: `account.${key}.com`, description: "Account portal" },
  ]
}

// ── Static data ───────────────────────────────────────────────────────────────

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text",
  medium: "text-risk-medium-text",
  high: "text-risk-high-text",
  critical: "text-risk-critical-text",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── Input state
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Analysis animation state
  const [analysisTarget, setAnalysisTarget] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(-1)
  const autoStarted = useRef(false)

  const [scanError, setScanError] = useState<string | null>(null)
  const activeScanId = useRef<string | null>(null)
  const isScanDone = useRef(false)

  // Focus input when ?focus=1 is passed (from "New Scan" header button)
  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      inputRef.current?.focus()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [searchParams])

  // Auto-start scan when ?target= is passed (e.g. from Lookalike Detection page)
  useEffect(() => {
    if (autoStarted.current) return
    const targetParam = searchParams.get("target")
    if (targetParam) {
      autoStarted.current = true
      setQuery(targetParam)
      setAnalysisTarget(targetParam)
      setAnalysisStep(-1)
      setIsAnalyzing(true)
    }
  }, [searchParams])

  // Trigger backend scan when analysis starts
  useEffect(() => {
    if (!isAnalyzing || !analysisTarget) return
    isScanDone.current = false
    activeScanId.current = null
    setScanError(null)

    let isMounted = true

    async function pollStatus(id: string) {
      try {
        const res = await fetch(`http://localhost:5001/api/v1/scan/${id}/status`)
        const data = await res.json()
        if (data?.data?.status === "completed") {
          activeScanId.current = id
          isScanDone.current = true
        } else {
          setTimeout(() => {
            if (isMounted && !isScanDone.current) pollStatus(id)
          }, 2000)
        }
      } catch (err) {
        console.error("Status polling failed:", err)
        activeScanId.current = id
        isScanDone.current = true
      }
    }

    async function executeScan() {
      try {
        const res = await fetch("http://localhost:5001/api/v1/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: analysisTarget }),
        })
        const result = await res.json()
        const returnedId = result?.data?.scanId || result?.data?.scan?.id

        if (returnedId) {
          activeScanId.current = returnedId
          if (result?.data?.status === "completed") {
            isScanDone.current = true
          } else {
            pollStatus(returnedId)
          }
        } else {
          isScanDone.current = true
        }
      } catch (err) {
        console.error("Scan submission error:", err)
        isScanDone.current = true
      }
    }

    executeScan()

    return () => {
      isMounted = false
    }
  }, [isAnalyzing, analysisTarget])

  // Analysis step sequencer tied to backend progress
  useEffect(() => {
    if (!isAnalyzing) return

    if (analysisStep === -1) {
      const t = setTimeout(() => setAnalysisStep(0), 100)
      return () => clearTimeout(t)
    }

    // If backend completed, quickly accelerate through remaining steps
    if (analysisStep >= ANALYSIS_STEPS.length - 1) {
      if (isScanDone.current) {
        const dest = activeScanId.current ? `/investigate/${activeScanId.current}` : "/investigate"
        const t = setTimeout(() => navigate(dest), 500)
        return () => clearTimeout(t)
      } else {
        // Wait at the penultimate step until scan completes
        return
      }
    }

    // Smoothly progress through analysis steps
    const stepDelay = isScanDone.current ? 80 : 350
    const t = setTimeout(() => {
      setAnalysisStep(s => s + 1)
    }, stepDelay)

    return () => clearTimeout(t)
  }, [isAnalyzing, analysisStep, navigate])

  const trimmed = query.trim()
  const inputType: InputType | null = trimmed ? detectType(trimmed) : null
  const isBrand = inputType === "brand"
  const showDropdownContent = showDropdown && isBrand && trimmed.length > 0
  const brandResults = showDropdownContent ? getBrandResults(trimmed) : []
  const canInvestigate = !!trimmed

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedResult(null)
    setShowDropdown(true)
  }

  const handleSelectResult = (result: SearchResult) => {
    setQuery(result.domain)
    setSelectedResult(result)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setQuery("")
    setSelectedResult(null)
    setShowDropdown(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleInvestigate = () => {
    if (!canInvestigate) return
    const target = selectedResult?.domain ?? trimmed
    setAnalysisTarget(target)
    setAnalysisStep(-1)
    setIsAnalyzing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setShowDropdown(false)
    if (e.key === "Enter" && canInvestigate) handleInvestigate()
  }

  // ── Analysis animation view ───────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 bg-secondary border border-border rounded-full px-4 py-2 mb-3 max-w-full">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="font-mono text-sm text-foreground truncate">{analysisTarget}</span>
            </div>
            <p className="text-xs text-muted-foreground">SecureLens is analyzing this target</p>
          </div>

          <div className="space-y-1">
            {ANALYSIS_STEPS.map((step, i) => {
              const isDone = analysisStep > i
              const isActive = analysisStep === i
              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-300",
                    isActive ? "bg-primary/5 border border-primary/20" : isDone ? "opacity-55" : "opacity-20"
                  )}
                >
                  <div className="shrink-0 h-5 w-5 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-risk-low-text" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    isActive  ? "font-medium text-foreground" :
                    isDone    ? "text-muted-foreground" :
                                "text-muted-foreground/40"
                  )}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Normal dashboard ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Quick Scan ── */}
      <div className="rounded-xl border border-border bg-white px-6 py-5">
        <h1 className="text-xl font-bold text-foreground mb-1">Scan a website</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a URL, domain, IP address, or website name to scan for security risks.
        </p>

        {/* Input row */}
        <div className="relative">
          <div className={cn(
            "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition-all",
            showDropdownContent
              ? "border-primary/40 rounded-b-none shadow-none"
              : "border-border focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/20"
          )}>
            {inputType && !isBrand ? (
              <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {inputType === "url" ? "URL" : inputType === "ip" ? "IP Address" : "Domain"}
              </span>
            ) : (
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            )}

            <input
              ref={inputRef}
              id="quick-investigate-input"
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="URL, domain, IP address, or website name…"
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none min-w-0"
            />

            {query && (
              <button
                onClick={handleClear}
                tabIndex={-1}
                className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <Button
              size="sm"
              onClick={handleInvestigate}
              disabled={!canInvestigate}
              className="shrink-0"
            >
              Scan
            </Button>
          </div>

          {/* Brand autocomplete dropdown */}
          {showDropdownContent && brandResults.length > 0 && (
            <div className="absolute left-0 right-0 z-50 rounded-b-xl border border-t-0 border-primary/40 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-secondary/40 border-b border-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Website results
                </span>
                <span className="text-[10px] text-muted-foreground/60 italic">
                  Illustrative — not a live search
                </span>
              </div>
              {brandResults.map((result, i) => (
                <button
                  key={result.domain}
                  onMouseDown={() => handleSelectResult(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors",
                    i < brandResults.length - 1 && "border-b border-border/50"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-none">{result.name}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{result.domain}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/80 shrink-0 hidden sm:block">
                    {result.description}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected result confirmation */}
        {selectedResult && !showDropdown && (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-risk-low-text shrink-0" />
            <div className="flex-1 min-w-0 text-xs">
              <span className="font-medium text-foreground">{selectedResult.name}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="font-mono text-muted-foreground">{selectedResult.domain}</span>
              <span className="text-muted-foreground"> selected</span>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
            >
              Change
            </button>
            <Button size="sm" onClick={handleInvestigate} className="shrink-0">
              Scan
            </Button>
          </div>
        )}
      </div>

      {/* ── Summary cards ── */}
      {/* @BACKEND-TODO: Fetch dashboard KPIs (Total Scans, Low/Medium/Critical Risk counts) from the backend API.
          Replace the `DASHBOARD_KPIS` mock data with live statistics. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DASHBOARD_KPIS.map(s => {
          let icon = Activity;
          let color = "text-foreground";
          let bg = "bg-secondary";
          
          if (s.type === "low") {
            icon = ShieldCheck;
            color = "text-risk-low-text";
            bg = "bg-risk-low-bg";
          } else if (s.type === "medium") {
            icon = Globe;
            color = "text-risk-medium-text";
            bg = "bg-risk-medium-bg";
          } else if (s.type === "critical") {
            icon = ShieldAlert;
            color = "text-risk-critical-text";
            bg = "bg-risk-critical-bg";
          }

          const IconComponent = icon;

          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", bg)}>
                  <IconComponent className={cn("h-5 w-5", color)} />
                </div>
                <div>
                  <p className={cn("text-xl font-bold tabular-nums leading-none", color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* Recent Scans — "View" goes directly to /investigate (no animation) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-semibold text-foreground">Recent Scans</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              Scan history <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Target</th>
                    <th className="px-3 py-2.5 font-medium">Risk</th>
                    <th className="px-3 py-2.5 font-medium">Score</th>
                    <th className="px-3 py-2.5 font-medium">Last Scanned</th>
                    <th className="px-3 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* @BACKEND-TODO: Fetch recent scans from a `/api/scans/recent` endpoint.
                      Replace the `RECENT_SCANS` mock array with live scan history data. */}
                  {RECENT_SCANS.map(row => (
                    <tr
                      key={row.target}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate("/investigate")}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-foreground">
                        <span className="truncate block max-w-xs">{row.target}</span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={row.risk}>{row.risk.toUpperCase()}</Badge>
                      </td>
                      <td className={cn("px-3 py-2 font-semibold tabular-nums text-xs", SCORE_COLOR[row.risk])}>
                        {row.score}/100
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{row.time}</td>
                      <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/investigate")}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">System Health</CardTitle>
              <CardDescription className="text-xs">Status of investigation engines</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              {/* @BACKEND-TODO: Fetch dynamic health metrics from `/api/health` endpoint.
                  Update status indicators (Operational / Degraded / Offline) based on backend engine status. */}
              {["DNS Resolution", "Threat Intel APIs", "SecureAI Engine"].map(svc => (
                <div key={svc} className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{svc}</span>
                  <span className="flex items-center gap-1.5 text-xs text-[#047857]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    Operational
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Lookalike Alerts</CardTitle>
              <CardDescription className="text-xs">Recently detected suspicious lookalike domains</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2 mb-3">
                {/* @BACKEND-TODO: Fetch live lookalike alerts from `/api/discovery/lookalikes`
                    Replace `LOOKALIKE_DISCOVERY` mock data. */}
                {LOOKALIKE_DISCOVERY.map(d => (
                  <div key={d.domain} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-xs text-foreground truncate block">{d.domain}</span>
                      <span className="text-[10px] text-muted-foreground">{d.age} old</span>
                    </div>
                    <Badge variant={d.risk}>{d.risk.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/discovery")}>
                View Lookalike Alerts <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
