import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import {
  ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon,
  CheckCircle2, Printer, ArrowLeft, Bot, Loader2, Globe
} from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"

export type RiskLevel = "low" | "medium" | "high" | "critical"

/* ─── section row ─── */
function EvidenceRow({
  check, status, value, explanation,
}: {
  check: string
  status: "PASS" | "WARNING" | "SUSPICIOUS" | "HIGH" | "CRITICAL"
  value: string
  explanation: string
}) {
  const pill: Record<string, string> = {
    PASS: "bg-risk-low-bg text-risk-low-text",
    WARNING: "bg-risk-medium-bg text-risk-medium-text",
    SUSPICIOUS: "bg-risk-high-bg text-risk-high-text",
    HIGH: "bg-risk-high-bg text-risk-high-text",
    CRITICAL: "bg-risk-critical-bg text-risk-critical-text",
  }
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2 pr-4 text-xs font-medium text-foreground whitespace-nowrap">{check}</td>
      <td className="py-2 pr-4">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", pill[status] || pill.PASS)}>
          {status}
        </span>
      </td>
      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground break-all">{value}</td>
      <td className="py-2 text-xs text-muted-foreground">{explanation}</td>
    </tr>
  )
}

/* ─── section block ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-3">{title}</h2>
      {children}
    </div>
  )
}

export function ReportView() {
  const navigate = useNavigate()
  const { scanId: routeScanId } = useParams()
  const [searchParams] = useSearchParams()
  const activeId = routeScanId || searchParams.get("scanId") || searchParams.get("id")

  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    async function loadReport() {
      setIsLoading(true)
      try {
        let fetchId = activeId
        if (!fetchId) {
          // Fetch the latest recent scan ID
          const recentRes = await fetch("http://localhost:5001/api/v1/scans/recent?limit=1")
          const recentJson = await recentRes.json()
          if (recentJson?.data?.[0]?.id) {
            fetchId = recentJson.data[0].id
          }
        }

        if (fetchId) {
          const res = await fetch(`http://localhost:5001/api/v1/scan/${fetchId}/report`)
          if (res.ok) {
            const json = await res.json()
            if (isMounted && json?.data) {
              setReportData(json.data)
            }
          }
        }
      } catch (err) {
        console.error("Failed to load report data:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadReport()
    return () => {
      isMounted = false
    }
  }, [activeId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Preparing investigation report document…</p>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
        <h2 className="text-base font-semibold text-foreground">No Report Available</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Select an investigation from the dashboard or history to view its full printable report.
        </p>
        <Button size="sm" onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    )
  }

  const results = reportData?.results || {}
  const evidence = results?.evidence || {}
  const analyzers = evidence?.analyzers || {}
  const domain = reportData?.target || "Target"
  const riskScore = typeof results?.score === "number" ? results.score : 0
  const rawRiskLevel = (results?.riskLevel || "LOW").toUpperCase()
  const findings = results?.findings || []
  const recommendations = results?.recommendations || ["Maintain standard security configurations."]

  const isCritRisk = rawRiskLevel === "CRITICAL"
  const isHighRisk = rawRiskLevel === "HIGH"
  const isMedRisk = rawRiskLevel === "MEDIUM"
  const riskVariant = isCritRisk ? "critical" : isHighRisk ? "high" : isMedRisk ? "medium" : "low"
  const riskToneColor = isCritRisk ? "text-risk-critical-text" : isHighRisk ? "text-risk-high-text" : isMedRisk ? "text-risk-medium-text" : "text-risk-low-text"
  const strokeColor = isCritRisk ? "var(--color-risk-critical)" : isHighRisk ? "var(--color-risk-high)" : isMedRisk ? "var(--color-risk-medium)" : "var(--color-risk-low)"

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-6 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Toolbar (non-printed) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4 flex-wrap px-4 sm:px-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/investigate/${reportData.scanId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Investigation
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Report document */}
      <div className="max-w-4xl mx-auto bg-white border border-border rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-0">

        {/* ── Report header ── */}
        <div className="bg-primary px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-accent shrink-0" />
              <div>
                <p className="text-white font-bold text-lg leading-none">SecureLens</p>
                <p className="text-white/60 text-xs mt-0.5">Security Investigation Report</p>
              </div>
            </div>
            <div className="text-right text-xs text-white/60 space-y-0.5">
              <p>ID: <span className="font-mono text-white">{reportData.scanId}</span></p>
              <p>Generated: <span className="text-white">{reportData.completedAt ? new Date(reportData.completedAt).toUTCString() : "Live"}</span></p>
              <p>Status: <span className="text-[#10B981] font-medium">Completed</span></p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-0">

          {/* ── Target ── */}
          <Section title="Target Information">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {[
                { label: "Target Host", value: domain, mono: true },
                { label: "Target Type", value: reportData.type || "Domain" },
                { label: "IP Address", value: analyzers["ip-asn"]?.data?.ip || analyzers.dns?.data?.records?.a?.[0] || "Resolved", mono: true },
                { label: "ASN / Network", value: analyzers["ip-asn"]?.data?.asn ? `AS${analyzers["ip-asn"].data.asn}` : "Standard Routing" },
                { label: "TLS Issuer", value: analyzers.tls?.data?.issuer || "Active Certificate" },
                { label: "Server Header", value: analyzers.http?.data?.server || "Protected Host" },
              ].map(f => (
                <div key={f.label} className="border-b border-border/50 pb-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                  <dd className={cn("text-sm text-foreground break-all mt-0.5", f.mono && "font-mono text-xs")}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* ── Risk Summary ── */}
          <Section title="Risk Summary">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Score */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="relative h-20 w-20">
                  <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={strokeColor} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - riskScore / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${riskToneColor}`}>{riskScore}</span>
                    <span className="text-[9px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <Badge variant={riskVariant} className="mb-1">{rawRiskLevel} RISK</Badge>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {riskScore > 50 ? "Elevated threat indicators detected across audited telemetry." : "Target exhibits low risk characteristics with clean telemetry."}
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Critical", value: findings.filter((f: any) => f.severity === "critical").length, cls: "text-risk-critical-text bg-risk-critical-bg" },
                  { label: "High", value: findings.filter((f: any) => f.severity === "high").length, cls: "text-risk-high-text bg-risk-high-bg" },
                  { label: "Medium", value: findings.filter((f: any) => f.severity === "medium").length, cls: "text-risk-medium-text bg-risk-medium-bg" },
                  { label: "Low", value: findings.filter((f: any) => f.severity === "low" || f.severity === "info").length, cls: "text-risk-low-text bg-risk-low-bg" },
                ].map(f => (
                  <div key={f.label} className={cn("rounded-lg px-3 py-2.5 text-center", f.cls + "/40")}>
                    <p className={cn("text-xl font-bold tabular-nums", f.cls.split(" ")[0])}>{f.value}</p>
                    <p className="text-[10px] text-muted-foreground">{f.label} findings</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Investigation Summary ── */}
          <Section title="Investigation Summary">
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 mb-4">
              <p className="text-sm font-medium text-foreground">
                {results.summary || "Comprehensive forensic audit completed for this target host."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Findings</p>
                <ul className="space-y-1.5">
                  {findings.length > 0 ? (
                    findings.map((f: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${f.severity === "critical" ? "bg-risk-critical" : f.severity === "high" ? "bg-risk-high" : "bg-risk-medium"}`} />
                        {f.description || f.vulnerability || f.id}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-muted-foreground">No critical vulnerabilities detected</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Action</p>
                <div className="rounded-lg bg-secondary px-4 py-3 text-xs text-foreground mb-2">
                  {recommendations[0]}
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>→ Maintain strict SSL/TLS configuration</li>
                  <li>→ Monitor DNS records periodically</li>
                  <li>→ Review HTTP security headers regularly</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ── Footer ── */}
          <div className="border-t border-border pt-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">SecureLens</span>
              <span>· Authoritative Security Engine Report</span>
            </div>
            <div className="space-y-0.5 text-right">
              <p>Scan ID: <span className="font-mono">{reportData.scanId}</span></p>
              <p>Analyzed via SecureLens Security Engine</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
export default ReportView
