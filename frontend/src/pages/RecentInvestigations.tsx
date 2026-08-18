import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Search, ChevronLeft, ChevronRight, FileText, ShieldAlert, AlertTriangle, Clock, History } from "lucide-react"
import { cn } from "../lib/utils"

import { RECENT_INVESTIGATIONS_HISTORY as MOCK, RiskLevel, InvType, Investigation } from "../lib/mockData"

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text", medium: "text-risk-medium-text",
  high: "text-risk-high-text", critical: "text-risk-critical-text",
}

const criticalCount = MOCK.filter(r => r.risk === "critical").length
const highCount     = MOCK.filter(r => r.risk === "high").length
const recentCount   = MOCK.filter(r => r.firstAnalyzedDate >= "2026-08-10").length

const STATS = [
  { label: "Total Investigations", value: MOCK.length, icon: FileText,     color: "text-foreground",          bg: "bg-secondary"        },
  { label: "Critical",             value: criticalCount, icon: ShieldAlert, color: "text-risk-critical-text",  bg: "bg-risk-critical-bg" },
  { label: "High Risk",            value: highCount,     icon: AlertTriangle,color:"text-risk-high-text",      bg: "bg-risk-high-bg"     },
  { label: "Last 48 Hours",        value: recentCount,   icon: Clock,       color: "text-risk-medium-text",    bg: "bg-risk-medium-bg"   },
]

const TYPE_LABELS: InvType[] = ["URL", "Domain", "IP Address", "Email", "QR Code"]
const PAGE_SIZE = 10

function getAuthUser(): { name: string; email: string } | null {
  try { const raw = localStorage.getItem("sl_auth"); return raw ? JSON.parse(raw) : null }
  catch { return null }
}

export function RecentInvestigations() {
  const navigate = useNavigate()
  const authUser = getAuthUser()
  const [search, setSearch]             = useState("")
  const [riskFilter, setRiskFilter]     = useState<RiskLevel | "all">("all")
  const [typeFilter, setTypeFilter]     = useState<InvType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing" | "failed">("all")
  const [dateFilter, setDateFilter]     = useState<"all" | "today" | "yesterday" | "week">("all")
  const [sort, setSort]                 = useState<"newest" | "oldest" | "risk">("newest")
  const [page, setPage]                 = useState(1)

  const riskOrder: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  const reset = () => setPage(1)

  const filtered = MOCK
    .filter(inv => {
      if (search && !inv.target.toLowerCase().includes(search.toLowerCase())) return false
      if (riskFilter !== "all" && inv.risk !== riskFilter) return false
      if (typeFilter !== "all" && inv.type !== typeFilter) return false
      if (statusFilter !== "all" && inv.status !== statusFilter) return false
      if (dateFilter === "today"     && inv.firstAnalyzedDate !== "2026-08-11") return false
      if (dateFilter === "yesterday" && inv.firstAnalyzedDate !== "2026-08-10") return false
      if (dateFilter === "week"      && inv.firstAnalyzedDate < "2026-08-05") return false
      return true
    })
    .sort((a, b) => {
      if (sort === "oldest") return parseInt(a.id) - parseInt(b.id)
      if (sort === "risk")   return riskOrder[b.risk] - riskOrder[a.risk]
      return parseInt(b.id) - parseInt(a.id)
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Guest gate — scanning is always available, but saved history requires an account
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh" }}>
        <div className="max-w-sm space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
            <History className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Log in to access Scan History</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Your completed scans are saved to your account.
              Log in or create a free account to view your personal scan history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/login")}>Log in</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Create account</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You can scan websites without an account.{" "}
            <button
              onClick={() => navigate("/")}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Start a new scan
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
        <p className="text-muted-foreground mt-1 text-sm">Scans you started — Quick Scan, QR, Email, Phone, and Browser Extension full scans. Automatically detected suspicious domains appear under Lookalike Detection, not here. Illustrative demo data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => (
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
          <input type="text" placeholder="Search targets…" value={search}
            onChange={e => { setSearch(e.target.value); reset() }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value as RiskLevel | "all"); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as InvType | "all"); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Types</option>
          {TYPE_LABELS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value as typeof dateFilter); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="risk">Highest Risk</option>
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
                <th className="px-3 py-2.5 font-medium">Findings</th>
                <th className="px-3 py-2.5 font-medium">First Analyzed</th>
                <th className="px-3 py-2.5 font-medium">Last Updated</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">No investigations match your filters.</td></tr>
              ) : paginated.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => navigate("/investigate")}>
                  <td className="px-3 py-2 font-mono text-xs text-foreground max-w-[200px]">
                    <span className="truncate block">{inv.target}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">{inv.type}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={inv.risk}>{inv.risk.toUpperCase()}</Badge>
                  </td>
                  <td className={cn("px-3 py-2 font-semibold tabular-nums text-xs", SCORE_COLOR[inv.risk])}>
                    {inv.score > 0 ? `${inv.score}/100` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {inv.status === "failed" ? (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    ) : (
                      <div className="flex gap-1 text-[10px] font-semibold">
                        {inv.findings.critical > 0 && <span className="text-risk-critical-text">{inv.findings.critical}C</span>}
                        {inv.findings.high > 0     && <span className="text-risk-high-text">{inv.findings.high}H</span>}
                        {inv.findings.medium > 0   && <span className="text-risk-medium-text">{inv.findings.medium}M</span>}
                        {inv.findings.low > 0      && <span className="text-risk-low-text">{inv.findings.low}L</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{inv.firstAnalyzed}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{inv.lastUpdated}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs whitespace-nowrap", {
                      "text-[#047857]":           inv.status === "completed",
                      "text-risk-medium-text":    inv.status === "processing",
                      "text-risk-critical-text":  inv.status === "failed",
                    })}>
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", {
                        "bg-[#10B981]":              inv.status === "completed",
                        "bg-risk-medium animate-pulse": inv.status === "processing",
                        "bg-risk-critical":          inv.status === "failed",
                      })} />
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/investigate")}
                      disabled={inv.status !== "completed"}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded border border-border bg-white disabled:opacity-40 hover:bg-secondary transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("px-2.5 py-1 rounded border text-xs transition-colors",
                    p === page ? "bg-primary text-white border-primary" : "border-border bg-white hover:bg-secondary"
                  )}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded border border-border bg-white disabled:opacity-40 hover:bg-secondary transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
