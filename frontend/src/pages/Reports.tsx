import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Search, Download, Eye, FileText, AlertTriangle, Clock, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"

import { MOCK_REPORTS, RiskLevel, ReportStatus, Report } from "../lib/mockData"

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text", medium: "text-risk-medium-text",
  high: "text-risk-high-text", critical: "text-risk-critical-text",
}

const REPORT_TYPES = ["all", "Full Investigation", "Domain Analysis", "Email Analysis", "URL Scan", "IP Analysis"]

const criticalCount = MOCK_REPORTS.filter(r => r.risk === "critical").length
const highCount     = MOCK_REPORTS.filter(r => r.risk === "high").length
const weekCount     = MOCK_REPORTS.filter(r => r.createdDate >= "2026-08-05").length

const STATS = [
  { label: "Total Reports",    value: MOCK_REPORTS.length, icon: FileText,     color: "text-foreground",          bg: "bg-secondary"        },
  { label: "Critical",         value: criticalCount,       icon: ShieldAlert,  color: "text-risk-critical-text",  bg: "bg-risk-critical-bg" },
  { label: "High Risk",        value: highCount,           icon: AlertTriangle, color: "text-risk-high-text",     bg: "bg-risk-high-bg"     },
  { label: "Last 7 Days",      value: weekCount,           icon: Clock,        color: "text-risk-medium-text",    bg: "bg-risk-medium-bg"   },
]

const PAGE_SIZE = 10

export function Reports() {
  const navigate = useNavigate()
  const [search, setSearch]           = useState("")
  const [riskFilter, setRiskFilter]   = useState<RiskLevel | "all">("all")
  const [typeFilter, setTypeFilter]   = useState("all")
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all")
  const [dateFilter, setDateFilter]   = useState("all")
  const [page, setPage]               = useState(1)
  const reset                          = () => setPage(1)

  const filtered = MOCK_REPORTS.filter(r => {
    if (search && !r.target.toLowerCase().includes(search.toLowerCase())) return false
    if (riskFilter !== "all" && r.risk !== riskFilter) return false
    if (typeFilter !== "all" && r.type !== typeFilter) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (dateFilter === "today"     && r.createdDate !== "2026-08-11") return false
    if (dateFilter === "yesterday" && r.createdDate !== "2026-08-10") return false
    if (dateFilter === "week"      && r.createdDate < "2026-08-05")   return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investigation Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review, organize, and export completed security investigations. Illustrative demo data.</p>
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
          <input type="text" placeholder="Search reports…" value={search}
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
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          {REPORT_TYPES.map(t => (
            <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as ReportStatus | "all"); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Statuses</option>
          <option value="ready">Ready</option>
          <option value="generating">Generating</option>
          <option value="failed">Failed</option>
        </select>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); reset() }}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-3 py-2.5 font-medium">Report / Target</th>
                <th className="px-3 py-2.5 font-medium">Risk</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Created</th>
                <th className="px-3 py-2.5 font-medium">Last Updated</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No reports match your filters.</td></tr>
              ) : paginated.map(report => (
                <tr key={report.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-foreground max-w-[200px]">
                    <span className="truncate block">{report.target}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={report.risk}>{report.risk.toUpperCase()}</Badge>
                  </td>
                  <td className={cn("px-3 py-2 font-semibold tabular-nums text-xs", SCORE_COLOR[report.risk])}>
                    {report.status === "failed" ? "—" : `${report.score}/100`}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">{report.type}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{report.created}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{report.lastUpdated}</td>
                  <td className="px-3 py-2">
                    {report.status === "ready" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#047857] whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Ready
                      </span>
                    )}
                    {report.status === "generating" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-risk-medium-text whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-risk-medium animate-pulse" /> Generating…
                      </span>
                    )}
                    {report.status === "failed" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-risk-critical-text whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-risk-critical" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm"
                        disabled={report.status !== "ready"}
                        onClick={() => navigate(report.id === "1" ? "/report" : "/investigate")}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm"
                        disabled={report.status !== "ready"}
                        onClick={() => navigate(report.id === "1" ? "/report" : "/investigate")}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
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
