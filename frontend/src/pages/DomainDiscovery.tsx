import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  ScanLine,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import { cn } from "../lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "critical"

interface LookalikeAlert {
  id: string
  candidate_domain: string
  matched_brand: string | null
  similarity_score: number | null
  risk_level: string | null
  detection_type: string | null
  detected_at: string | null
  status: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// Derive a normalised RiskLevel from the DB row.
// Falls back to score-based derivation if risk_level is missing/unknown.
function deriveRisk(row: LookalikeAlert): RiskLevel {
  const raw = (row.risk_level || "").toLowerCase()
  if (raw === "critical") return "critical"
  if (raw === "high")     return "high"
  if (raw === "medium")   return "medium"
  if (raw === "low")      return "low"

  // Score-based fallback (paranoia-mode bands)
  const score = typeof row.similarity_score === "number"
    ? row.similarity_score * 100
    : null

  if (score === null) return "medium"
  if (score >= 76)   return "critical"
  if (score >= 41)   return "high"
  if (score >= 16)   return "medium"
  return "low"
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DomainDiscovery() {
  const navigate = useNavigate()

  const [alerts, setAlerts]       = useState<LookalikeAlert[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError]   = useState<boolean>(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const [search, setSearch]         = useState("")
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [page, setPage]             = useState(1)

  // ── Data fetching ──────────────────────────────────────────────────────────
  const loadAlerts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    setHasError(false)
    try {
      // Use the dedicated lookalikes endpoint — supports up to 50 results per page.
      // Fetch two pages to get up to 100 records for the local table.
      const [res1, res2] = await Promise.all([
        fetch("http://localhost:5001/api/v1/lookalikes?limit=50&page=1"),
        fetch("http://localhost:5001/api/v1/lookalikes?limit=50&page=2"),
      ])

      const combined: LookalikeAlert[] = []
      let anySuccess = false

      if (res1.ok) {
        anySuccess = true
        const json = await res1.json()
        if (Array.isArray(json?.data)) combined.push(...json.data)
      }
      if (res2.ok) {
        anySuccess = true
        const json = await res2.json()
        if (Array.isArray(json?.data) && json.data.length > 0) combined.push(...json.data)
      }

      if (!anySuccess && (!res1.ok || !res2.ok)) {
        setHasError(true)
      } else {
        setHasError(false)
      }

      // Deduplicate by id
      const seen = new Set<string>()
      const deduped = combined.filter(a => {
        if (seen.has(a.id)) return false
        seen.add(a.id)
        return true
      })

      setAlerts(deduped)
      setLastFetch(new Date())
    } catch (err) {
      console.error("Failed to load lookalike alerts:", err)
      setHasError(true)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
    
    // Set up a 5-second poll interval for real-time automatic synchronization
    const interval = setInterval(() => {
      loadAlerts(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [loadAlerts])

  // ── Derived stats (score-aware) ────────────────────────────────────────────
  const criticalCount = alerts.filter(a => deriveRisk(a) === "critical").length
  const highCount     = alerts.filter(a => deriveRisk(a) === "high").length

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = alerts.filter(a => {
    const q = search.toLowerCase()
    const candidate = (a.candidate_domain || "").toLowerCase()
    const brand     = (a.matched_brand    || "").toLowerCase()
    if (q && !candidate.includes(q) && !brand.includes(q)) return false
    if (riskFilter !== "all" && deriveRisk(a) !== riskFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleScan = (domain: string) => navigate(`/?target=${encodeURIComponent(domain)}`)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Lookalike Detection</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Newly registered and audited domains monitored for trademark impersonation and homoglyph abuse.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastFetch && !isLoading && (
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            {isLoading ? "Loading…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Monitored",
            value: isLoading ? "—" : alerts.length,
            icon: ShieldAlert,
            color: "text-foreground",
            bg: "bg-secondary",
          },
          {
            label: "Critical Risk",
            value: isLoading ? "—" : criticalCount,
            icon: AlertTriangle,
            color: "text-risk-critical-text",
            bg: "bg-risk-critical-bg",
          },
          {
            label: "High Risk",
            value: isLoading ? "—" : highCount,
            icon: AlertTriangle,
            color: "text-risk-high-text",
            bg: "bg-risk-high-bg",
          },
          {
            label: "Feed Status",
            value: hasError ? "Error" : "Live",
            icon: hasError ? WifiOff : Wifi,
            color: hasError ? "text-risk-critical-text" : "text-[#047857]",
            bg: hasError ? "bg-risk-critical-bg" : "bg-risk-low-bg",
          },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                <p className={cn("text-xl font-bold tabular-nums leading-none", s.color)}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Error banner ── */}
      {hasError && !isLoading && (
        <div className="flex items-center gap-3 rounded-lg border border-risk-critical-text/30 bg-risk-critical-bg/40 px-4 py-3 text-sm">
          <WifiOff className="h-4 w-4 text-risk-critical-text shrink-0" />
          <span className="text-foreground">
            Could not reach the backend. Make sure the API server is running at{" "}
            <code className="font-mono text-xs">localhost:5001</code>.
          </span>
          <Button variant="outline" size="sm" onClick={loadAlerts} className="ml-auto shrink-0">
            Retry
          </Button>
        </div>
      )}

      {/* ── Filters ── */}
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

        {filtered.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 font-medium">Candidate Lookalike Domain</th>
                <th className="px-4 py-2.5 font-medium">Target Brand</th>
                <th className="px-4 py-2.5 font-medium text-right">Similarity</th>
                <th className="px-4 py-2.5 font-medium">Risk</th>
                <th className="px-4 py-2.5 font-medium">Detection Type</th>
                <th className="px-4 py-2.5 font-medium">Detected</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-muted/60 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShieldAlert className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium text-foreground">
                        {search || riskFilter !== "all"
                          ? "No records match the current filters."
                          : "No active lookalike threat records found."}
                      </p>
                      <p className="text-xs max-w-xs">
                        {search || riskFilter !== "all"
                          ? "Try adjusting your search terms or risk filter."
                          : "The threat feed is empty. Records will appear here when lookalike domains are detected by the NRD ingestion pipeline."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map(row => {
                  const risk = deriveRisk(row)
                  // similarity_score from DB is a 0–1 float; display as 0–100%
                  const simPct =
                    typeof row.similarity_score === "number"
                      ? Math.round(row.similarity_score <= 1
                          ? row.similarity_score * 100
                          : row.similarity_score)
                      : null

                  return (
                    <tr
                      key={row.id || row.candidate_domain}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-risk-critical-text font-medium">
                          {row.candidate_domain}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">
                        {row.matched_brand || "Protected Brand"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {simPct !== null ? (
                          <span
                            className={cn(
                              "text-sm font-bold tabular-nums",
                              simPct >= 90
                                ? "text-risk-critical-text"
                                : simPct >= 76
                                ? "text-risk-high-text"
                                : "text-risk-medium-text"
                            )}
                          >
                            {simPct}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={risk}>{risk.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {row.detection_type || "Lookalike Domain"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {row.detected_at
                          ? new Date(row.detected_at).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Live"}
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
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
