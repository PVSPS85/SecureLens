import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Search, ChevronLeft, ChevronRight, FileText, ShieldAlert, AlertTriangle, Clock, History } from "lucide-react"
import { cn } from "../lib/utils"

export type RiskLevel = "low" | "medium" | "high" | "critical"

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text",
  medium: "text-risk-medium-text",
  high: "text-risk-high-text",
  critical: "text-risk-critical-text",
}

const PAGE_SIZE = 10

function getAuthUser(): { name: string; email: string } | null {
  try {
    const raw = localStorage.getItem("sl_auth")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function RecentInvestigations() {
  const navigate = useNavigate()
  const authUser = getAuthUser()
  const [scans, setScans] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadScans() {
      setIsLoading(true)
      try {
        const res = await fetch("http://localhost:5001/api/v1/scans/recent?limit=50")
        if (res.ok) {
          const json = await res.json()
          if (isMounted && Array.isArray(json?.data)) {
            setScans(json.data)
          }
        }
      } catch (err) {
        console.error("Failed to load live scan history:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadScans()
    return () => {
      isMounted = false
    }
  }, [])

  const criticalCount = scans.filter(r => (r.risk_level || "").toLowerCase() === "critical").length
  const highCount = scans.filter(r => (r.risk_level || "").toLowerCase() === "high").length
  const safeCount = scans.filter(r => (r.risk_level || "").toLowerCase() === "low" || (r.risk_level || "").toLowerCase() === "safe").length

  const stats = [
    { label: "Total Scans", value: scans.length, icon: FileText, color: "text-foreground", bg: "bg-secondary" },
    { label: "Critical", value: criticalCount, icon: ShieldAlert, color: "text-risk-critical-text", bg: "bg-risk-critical-bg" },
    { label: "High Risk", value: highCount, icon: AlertTriangle, color: "text-risk-high-text", bg: "bg-risk-high-bg" },
    { label: "Clean / Low Risk", value: safeCount, icon: Clock, color: "text-risk-low-text", bg: "bg-risk-low-bg" },
  ]

  const filtered = scans.filter(inv => {
    if (search && !inv.target.toLowerCase().includes(search.toLowerCase())) return false
    if (riskFilter !== "all" && (inv.risk_level || "").toLowerCase() !== riskFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Live record of completed URL, domain, and host investigations from Supabase.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search targets…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={riskFilter}
          onChange={e => { setRiskFilter(e.target.value as RiskLevel | "all"); setPage(1) }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-3 py-2.5 font-medium">Target</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Risk</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Scanned Date</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {isLoading ? "Loading scan history…" : "No investigations match your filters."}
                  </td>
                </tr>
              ) : paginated.map(inv => {
                const risk = (inv.risk_level || "low").toLowerCase() as RiskLevel
                const score = typeof inv.risk_score === "number" ? inv.risk_score : 0
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/investigate/${inv.id}`)}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-foreground max-w-[240px]">
                      <span className="truncate block">{inv.target}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                        {inv.target_type || "Domain"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={risk}>{risk.toUpperCase()}</Badge>
                    </td>
                    <td className={cn("px-3 py-2 font-semibold tabular-nums text-xs", SCORE_COLOR[risk])}>
                      {score}/100
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : "Recently"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#047857]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        {inv.status || "Completed"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/investigate/${inv.id}`)}>
                        View
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-border bg-white disabled:opacity-40 hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "px-2.5 py-1 rounded border text-xs transition-colors",
                    p === page ? "bg-primary text-white border-primary" : "border-border bg-white hover:bg-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-border bg-white disabled:opacity-40 hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
export default RecentInvestigations
