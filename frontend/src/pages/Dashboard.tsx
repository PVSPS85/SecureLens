import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import {
  ShieldAlert, ShieldCheck, Globe, Activity, ArrowRight,
  Search, X, CheckCircle2, Loader2,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { cn } from "../lib/utils"

export type RiskLevel = "low" | "medium" | "high" | "critical"
type InputType = "url" | "ip" | "domain"

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

function detectType(v: string): InputType {
  const t = v.trim()
  if (/^https?:\/\//i.test(t)) return "url"
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(t)) return "ip"
  return "domain"
}

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text",
  medium: "text-risk-medium-text",
  high: "text-risk-high-text",
  critical: "text-risk-critical-text",
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "Just now"
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hr ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } catch {
    return "Recently"
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── Input state
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Analysis animation state
  const [analysisTarget, setAnalysisTarget] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(-1)
  const autoStarted = useRef(false)

  const activeScanId = useRef<string | null>(null)
  const isScanDone = useRef(false)

  // ── Live backend data state
  const [metrics, setMetrics] = useState<{
    totalScans: number
    critical: number
    high: number
    medium: number
    low: number
    cleanPercentage: number
  }>({
    totalScans: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    cleanPercentage: 100
  })

  const [recentScans, setRecentScans] = useState<Array<any>>([])
  const [lookalikeAlerts, setLookalikeAlerts] = useState<Array<any>>([])
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true)

  // Focus input when ?focus=1 is passed
  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      inputRef.current?.focus()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [searchParams])

  // Fetch live dashboard metrics, recent scans, and lookalike alerts from backend
  useEffect(() => {
    let isMounted = true

    async function fetchDashboardData() {
      setIsLoadingData(true)
      try {
        const [metricsRes, recentRes, lookalikesRes] = await Promise.allSettled([
          fetch("http://localhost:5001/api/v1/scans/metrics"),
          fetch("http://localhost:5001/api/v1/scans/recent?limit=8"),
          fetch("http://localhost:5001/api/v1/scans/lookalikes?limit=5")
        ])

        if (metricsRes.status === "fulfilled" && metricsRes.value.ok) {
          const json = await metricsRes.value.json()
          if (isMounted && json?.data) {
            setMetrics(json.data)
          }
        }

        if (recentRes.status === "fulfilled" && recentRes.value.ok) {
          const json = await recentRes.value.json()
          if (isMounted && Array.isArray(json?.data)) {
            setRecentScans(json.data)
          }
        }

        if (lookalikesRes.status === "fulfilled" && lookalikesRes.value.ok) {
          const json = await lookalikesRes.value.json()
          if (isMounted && Array.isArray(json?.data)) {
            setLookalikeAlerts(json.data)
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard live telemetry:", err)
      } finally {
        if (isMounted) setIsLoadingData(false)
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  // Auto-start scan when ?target= is passed
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

    if (analysisStep >= ANALYSIS_STEPS.length - 1) {
      if (isScanDone.current) {
        const dest = activeScanId.current ? `/investigate/${activeScanId.current}` : "/"
        const t = setTimeout(() => navigate(dest), 500)
        return () => clearTimeout(t)
      } else {
        return
      }
    }

    const stepDelay = isScanDone.current ? 80 : 350
    const t = setTimeout(() => {
      setAnalysisStep(s => s + 1)
    }, stepDelay)

    return () => clearTimeout(t)
  }, [isAnalyzing, analysisStep, navigate])

  const trimmed = query.trim()
  const inputType: InputType | null = trimmed ? detectType(trimmed) : null
  const canInvestigate = !!trimmed

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleClear = () => {
    setQuery("")
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleInvestigate = () => {
    if (!canInvestigate) return
    setAnalysisTarget(trimmed)
    setAnalysisStep(-1)
    setIsAnalyzing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                    isActive ? "font-medium text-foreground" :
                    isDone ? "text-muted-foreground" :
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
  const dynamicKPIs = [
    { label: "Total Scans", value: String(metrics.totalScans), type: "total", icon: Activity, color: "text-foreground", bg: "bg-secondary" },
    { label: "Safe / Low Risk", value: String(metrics.low), type: "low", icon: ShieldCheck, color: "text-risk-low-text", bg: "bg-risk-low-bg" },
    { label: "Medium Risk", value: String(metrics.medium), type: "medium", icon: Globe, color: "text-risk-medium-text", bg: "bg-risk-medium-bg" },
    { label: "Critical Threats", value: String(metrics.critical + metrics.high), type: "critical", icon: ShieldAlert, color: "text-risk-critical-text", bg: "bg-risk-critical-bg" },
  ]

  return (
    <div className="space-y-6">

      {/* ── Quick Scan ── */}
      <div className="rounded-xl border border-border bg-white px-6 py-5">
        <h1 className="text-xl font-bold text-foreground mb-1">Scan a target</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a URL, domain, or IP address to run comprehensive forensic security checks.
        </p>

        {/* Input row */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/20 transition-all">
            {inputType ? (
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
              onKeyDown={handleKeyDown}
              placeholder="Enter URL, domain, or IP address…"
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none min-w-0 font-mono"
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
        </div>
      </div>

      {/* ── Live Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dynamicKPIs.map(s => {
          const IconComponent = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", s.bg)}>
                  <IconComponent className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className={cn("text-xl font-bold tabular-nums leading-none", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

        {/* Recent Scans Table */}
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
                  {recentScans.length > 0 ? (
                    recentScans.map(row => {
                      const riskLevel = (row.risk_level || "low").toLowerCase() as RiskLevel
                      const score = typeof row.risk_score === "number" ? row.risk_score : 0
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={() => navigate(`/investigate/${row.id}`)}
                        >
                          <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                            <span className="truncate block max-w-xs">{row.target}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant={riskLevel}>{riskLevel.toUpperCase()}</Badge>
                          </td>
                          <td className={cn("px-3 py-2.5 font-semibold tabular-nums text-xs", SCORE_COLOR[riskLevel])}>
                            {score}/100
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(row.created_at)}
                          </td>
                          <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/investigate/${row.id}`)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                        {isLoadingData ? "Loading recent scans…" : "No recent scans found. Enter a target above to launch your first scan."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: System Health & Lookalike Alerts */}
        <div className="space-y-4">

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">System Health</CardTitle>
              <CardDescription className="text-xs">Status of investigation engines</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              {[
                { name: "DNS Resolution", status: "Operational" },
                { name: "Security Engine", status: "Operational" },
                { name: "SecureAI Engine", status: "Operational" }
              ].map(svc => (
                <div key={svc.name} className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{svc.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-[#047857]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    {svc.status}
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
                {lookalikeAlerts.length > 0 ? (
                  lookalikeAlerts.map(d => {
                    const risk = (d.risk_level || "medium").toLowerCase() as RiskLevel
                    return (
                      <div key={d.id || d.candidate_domain} className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs text-foreground truncate block">{d.candidate_domain}</span>
                          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(d.detected_at)}</span>
                        </div>
                        <Badge variant={risk}>{risk.toUpperCase()}</Badge>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No active lookalike alerts detected.
                  </p>
                )}
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
