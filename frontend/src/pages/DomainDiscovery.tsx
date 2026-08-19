import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Search, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, ScanLine } from "lucide-react"
import { cn } from "../lib/utils"

export type RiskLevel = "low" | "medium" | "high" | "critical"

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text",
  medium: "text-risk-medium-text",
  high: "text-risk-high-text",
  critical: "text-risk-critical-text",
}

const PAGE_SIZE = 12

export function DomainDiscovery() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadAlerts() {
      setIsLoading(true)
      try {
        const res = await fetch("http://localhost:5001/api/v1/scans/lookalikes?limit=50")
        if (res.ok) {
          const json = await res.json()
          if (isMounted && Array.isArray(json?.data)) {
            setAlerts(json.data)
          }
        }
      } catch (err) {
        console.error("Failed to load lookalike alerts:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadAlerts()
    return () => {
      isMounted = false
    }
  }, [])

  const criticalCount = alerts.filter(p => (p.risk_level || "").toLowerCase() === "critical").length
  const highCount = alerts.filter(p => (p.risk_level || "").toLowerCase() === "high").length

  const filtered = alerts.filter(p => {
    const q = search.toLowerCase()
    const candidate = (p.candidate_domain || "").toLowerCase()
    const brand = (p.matched_brand || "").toLowerCase()
    if (q && !candidate.includes(q) && !brand.includes(q)) return false
    if (riskFilter !== "all" && (p.risk_level || "").toLowerCase() !== riskFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleScan = (domain: string) => {
    navigate(`/?target=${encodeURIComponent(domain)}`)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Lookalike Detection</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Newly registered and audited domains monitored for trademark impersonation and homoglyph abuse.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Monitored", value: alerts.length, icon: ShieldAlert, color: "text-foreground", bg: "bg-secondary" },
          { label: "Critical Risk", value: criticalCount, icon: AlertTriangle, color: "text-risk-critical-text", bg: "bg-risk-critical-bg" },
          { label: "High Risk", value: highCount, icon: AlertTriangle, color: "text-risk-high-text", bg: "bg-risk-high-bg" },
          { label: "Active Feed", value: "Live", icon: ShieldAlert, color: "text-[#047857]", bg: "bg-risk-low-bg" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                <p className={cn("text-xl font-bold tabular-nums leading-none", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search brand or candidate domain…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low"] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); setPage(1) }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                riskFilter === r
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 font-medium">Candidate Lookalike Domain</th>
                <th className="px-4 py-2.5 font-medium">Target Brand</th>
                <th className="px-4 py-2.5 font-medium text-right">Similarity Score</th>
                <th className="px-4 py-2.5 font-medium">Risk</th>
                <th className="px-4 py-2.5 font-medium">Detection Type</th>
                <th className="px-4 py-2.5 font-medium">Detected</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {isLoading ? "Loading lookalike threat feed…" : "No active lookalike threat records match current filters."}
                  </td>
                </tr>
              ) : pageRows.map(row => {
                const risk = (row.risk_level || "medium").toLowerCase() as RiskLevel
                const sim = row.similarity_score ? Math.round(row.similarity_score * 100) : 85
                return (
                  <tr key={row.id || row.candidate_domain} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-risk-critical-text font-medium">{row.candidate_domain}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">
                      {row.matched_brand || "Protected Brand"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-bold tabular-nums", sim >= 90 ? "text-risk-critical-text" : sim >= 80 ? "text-risk-high-text" : "text-risk-medium-text")}>
                        {sim}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={risk}>{risk.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {row.detection_type || "Lookalike Domain"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {row.detected_at ? new Date(row.detected_at).toLocaleDateString() : "Live"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScan(row.candidate_domain)}
                        className="gap-1.5"
                      >
                        <ScanLine className="h-3.5 w-3.5" />
                        Scan
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
export default DomainDiscovery
