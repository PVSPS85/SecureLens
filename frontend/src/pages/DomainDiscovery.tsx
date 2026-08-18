import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Search, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, ScanLine } from "lucide-react"
import { cn } from "../lib/utils"

import { LOOKALIKE_PAIRS as PAIRS, RiskLevel, DetectionType, LookalikePair } from "../lib/mockData"

// @BACKEND-TODO: Fetch lookalike domain pairs from the backend (e.g., GET /api/discovery/lookalikes).
// Replace the `PAIRS` constant (derived from `LOOKALIKE_PAIRS` mock data) with the dynamically fetched list.
// The backend should also handle server-side pagination, searching, and filtering instead of filtering entirely on the client.

const DETECTION_LABELS: Record<DetectionType, string> = {
  "brand-impersonation":  "Brand Impersonation",
  "lookalike-domain":     "Lookalike Domain",
  "typosquatting":        "Typosquatting",
  "keyword-impersonation": "Keyword Impersonation",
}

const SCORE_COLOR: Record<RiskLevel, string> = {
  low: "text-risk-low-text", medium: "text-risk-medium-text",
  high: "text-risk-high-text", critical: "text-risk-critical-text",
}

const BRAND_INITIAL_BG: Record<string, string> = {
  "Apple":           "bg-[#555] text-white",
  "Chase":           "bg-[#117ACA] text-white",
  "Bank of America": "bg-[#DC2626] text-white",
  "Coinbase":        "bg-[#0052FF] text-white",
  "Instagram":       "bg-[#E1306C] text-white",
  "Wells Fargo":     "bg-[#D71E28] text-white",
  "GitHub":          "bg-[#24292e] text-white",
  "PayPal":          "bg-[#003087] text-white",
  "Netflix":         "bg-[#E50914] text-white",
  "Microsoft":       "bg-[#00A4EF] text-white",
  "Google":          "bg-[#4285F4] text-white",
  "Amazon":          "bg-[#FF9900] text-[#111]",
  "IRS":             "bg-[#1E40AF] text-white",
  "Dropbox":         "bg-[#0061FF] text-white",
  "LinkedIn":        "bg-[#0A66C2] text-white",
}

const ALL_BRANDS = [...new Set(PAIRS.map(p => p.brand))].sort()

const criticalCount = PAIRS.filter(p => p.risk === "critical").length
const highCount     = PAIRS.filter(p => p.risk === "high").length
const todayCount    = PAIRS.filter(p => p.detectedDate === "2026-08-11").length

const PAGE_SIZE = 12

function similarityColor(s: number) {
  if (s >= 90) return "text-risk-critical-text"
  if (s >= 80) return "text-risk-high-text"
  if (s >= 70) return "text-risk-medium-text"
  return "text-muted-foreground"
}

export function DomainDiscovery() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [detectionFilter, setDetectionFilter] = useState<"all" | DetectionType>("all")
  const [similarityFilter, setSimilarityFilter] = useState<"all" | "90" | "80" | "70">("all")
  const [page, setPage] = useState(1)

  const filtered = PAIRS.filter(p => {
    const q = search.toLowerCase()
    if (q && !p.brand.toLowerCase().includes(q) && !p.lookalikeDomain.toLowerCase().includes(q) && !p.legitimateDomain.toLowerCase().includes(q)) return false
    if (riskFilter !== "all" && p.risk !== riskFilter) return false
    if (brandFilter !== "all" && p.brand !== brandFilter) return false
    if (detectionFilter !== "all" && p.detection !== detectionFilter) return false
    if (similarityFilter !== "all" && p.similarity < parseInt(similarityFilter)) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetPage = () => setPage(1)

  const handleScan = (domain: string) => {
    navigate(`/?target=${encodeURIComponent(domain)}`)
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Lookalike Detection</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Websites detected as imitating legitimate brands and domains.
        </p>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Detected",  value: PAIRS.length, icon: ShieldAlert, color: "text-foreground",          bg: "bg-secondary"        },
          { label: "Critical",        value: criticalCount, icon: AlertTriangle, color: "text-risk-critical-text", bg: "bg-risk-critical-bg" },
          { label: "High Risk",       value: highCount,     icon: AlertTriangle, color: "text-risk-high-text",    bg: "bg-risk-high-bg"     },
          { label: "Last 24 Hours",   value: todayCount,    icon: ShieldAlert, color: "text-muted-foreground",   bg: "bg-secondary"        },
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

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            placeholder="Search brand or domain…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Risk pills */}
        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low"] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); resetPage() }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                riskFilter === r
                  ? r === "all"
                    ? "bg-foreground text-background border-foreground"
                    : r === "critical" ? "bg-risk-critical text-white border-risk-critical"
                    : r === "high"     ? "bg-risk-high text-white border-risk-high"
                    : r === "medium"   ? "bg-risk-medium text-white border-risk-medium"
                    : "bg-risk-low text-white border-risk-low"
                  : "bg-white border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Brand */}
        <select
          value={brandFilter}
          onChange={e => { setBrandFilter(e.target.value); resetPage() }}
          className="text-xs border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">All brands</option>
          {ALL_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Detection type */}
        <select
          value={detectionFilter}
          onChange={e => { setDetectionFilter(e.target.value as typeof detectionFilter); resetPage() }}
          className="text-xs border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">All detections</option>
          <option value="brand-impersonation">Brand Impersonation</option>
          <option value="lookalike-domain">Lookalike Domain</option>
          <option value="typosquatting">Typosquatting</option>
          <option value="keyword-impersonation">Keyword Impersonation</option>
        </select>

        {/* Similarity threshold */}
        <select
          value={similarityFilter}
          onChange={e => { setSimilarityFilter(e.target.value as typeof similarityFilter); resetPage() }}
          className="text-xs border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">Any similarity</option>
          <option value="90">&ge; 90%</option>
          <option value="80">&ge; 80%</option>
          <option value="70">&ge; 70%</option>
        </select>

        {/* Active filters count */}
        {filtered.length !== PAIRS.length && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {PAIRS.length} shown
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 font-medium">Brand / Legitimate Site</th>
                <th className="px-4 py-2.5 font-medium">Suspicious Lookalike</th>
                <th className="px-4 py-2.5 font-medium text-right">Similarity</th>
                <th className="px-4 py-2.5 font-medium">Risk</th>
                <th className="px-4 py-2.5 font-medium">Detection</th>
                <th className="px-4 py-2.5 font-medium">Detected</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No lookalike pairs match the current filters.
                  </td>
                </tr>
              ) : pageRows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Brand / Legitimate */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "h-7 w-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0",
                        BRAND_INITIAL_BG[row.brand] ?? "bg-secondary text-foreground"
                      )}>
                        {row.brand.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-none">{row.brand}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{row.legitimateDomain}</p>
                      </div>
                    </div>
                  </td>

                  {/* Suspicious Lookalike */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-risk-critical-text font-medium">{row.lookalikeDomain}</span>
                  </td>

                  {/* Similarity */}
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-sm font-bold tabular-nums", similarityColor(row.similarity))}>
                      {row.similarity}%
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="px-4 py-3">
                    <Badge variant={row.risk}>{row.risk.toUpperCase()}</Badge>
                  </td>

                  {/* Detection */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-foreground">{DETECTION_LABELS[row.detection]}</span>
                  </td>

                  {/* Detected */}
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {row.detected}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScan(row.lookalikeDomain)}
                      className="gap-1.5"
                    >
                      <ScanLine className="h-3.5 w-3.5" />
                      Scan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      <p className="text-[11px] text-muted-foreground">
        Prototype — illustrative lookalike detection data. Does not represent real-time scanning.
      </p>
    </div>
  )
}
