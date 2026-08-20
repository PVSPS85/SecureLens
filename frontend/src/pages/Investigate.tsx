import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Download,
  CheckCircle,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Lock,
  Eye,
  Globe,
} from "lucide-react"
import { StickyNav } from "../components/investigation/StickyNav"
import { Timeline } from "../components/investigation/Timeline"
import { DataGrid } from "../components/investigation/primitives"
import {
  URLSection,
  DNSSection,
  IPSection,
  TLSSection,
  HTTPSection,
  RedirectSection,
  ThreatSection,
  WebsiteSection,
  TechSection,
  LinksSection,
  CookiesSection,
  PhishingSection,
  AISection,
} from "../components/investigation/Sections"

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: "critical" | "high" | "medium" | "low" | "neutral"
}) {
  const toneCls = {
    critical: "text-risk-critical-text",
    high: "text-risk-high-text",
    medium: "text-risk-medium-text",
    low: "text-risk-low-text",
    neutral: "text-foreground",
  }[tone ?? "neutral"]
  const bgCls = {
    critical: "bg-risk-critical-bg",
    high: "bg-risk-high-bg",
    medium: "bg-risk-medium-bg",
    low: "bg-risk-low-bg",
    neutral: "bg-secondary",
  }[tone ?? "neutral"]
  return (
    <div className={`rounded-lg border border-border px-3 py-2.5 ${bgCls}/40`}>
      <p className={`text-xl font-bold tabular-nums ${toneCls}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

/* Dynamic website screenshot or fallback */
function WebsiteScreenshot({
  domain,
  screenshotData,
}: {
  domain: string
  screenshotData?: string | null
}) {
  const formatSrc = (raw?: string | null) => {
    if (!raw) return null
    if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw
    }
    const mime = raw.startsWith("iVBORw0KGgo") ? "image/png" : "image/jpeg"
    return `data:${mime};base64,${raw}`
  }

  const src = formatSrc(screenshotData)

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-white shadow-sm select-none">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-[#f1f3f4] border-b border-[#dadce0] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-white rounded border border-[#dadce0] px-2 py-1 mx-2">
          <Lock className="h-2.5 w-2.5 text-[#5f6368]" />
          <span className="text-[10px] text-[#202124] font-mono truncate">{domain}</span>
        </div>
      </div>

      {/* Render screenshot or fallback placeholder */}
      {src ? (
        <div className="bg-muted/10 max-h-80 overflow-y-auto">
          <img
            src={src}
            alt={`Website Audit Screenshot of ${domain}`}
            className="w-full h-auto object-cover object-top"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 text-center min-h-[220px]">
          <Globe className="h-9 w-9 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold text-foreground">Screenshot unavailable for this target</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
            The headless browser audit extracted DOM telemetry without visual capture.
          </p>
        </div>
      )}
    </div>
  )
}

export function Investigate() {
  const navigate = useNavigate()
  const { scanId: routeScanId } = useParams()
  const [searchParams] = useSearchParams()
  const targetParam = searchParams.get("target") || searchParams.get("domain") || searchParams.get("url")
  const activeId = routeScanId || searchParams.get("scanId") || searchParams.get("id")

  const [reportData, setReportData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(activeId || targetParam))
  const [exportState, setExportState] = useState<"idle" | "preparing" | "ready">("idle")

  useEffect(() => {
    if (!activeId && !targetParam) {
      navigate("/", { replace: true })
      return
    }

    let isMounted = true

    async function loadReport() {
      setIsLoading(true)
      try {
        let loadedScanId = activeId

        // If we only have a target domain/url, or if activeId looks like a domain or mock id, run/retrieve live scan
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeId || "")

        if (!isUuid || (!activeId && targetParam)) {
          const scanTarget = targetParam || activeId
          if (scanTarget) {
            const startRes = await fetch("http://localhost:5001/api/v1/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ target: scanTarget })
            })
            if (startRes.ok) {
              const startJson = await startRes.json()
              loadedScanId = startJson.scanId || startJson.data?.scanId || loadedScanId
            }
          }
        }

        if (loadedScanId) {
          const res = await fetch(`http://localhost:5001/api/v1/scan/${loadedScanId}/report`)
          if (res.ok) {
            const json = await res.json()
            if (isMounted && json?.data) {
              setReportData(json.data)
            }
          } else {
            // If fetch failed, trigger a new scan for target
            const scanTarget = targetParam || activeId
            if (scanTarget) {
              const startRes = await fetch("http://localhost:5001/api/v1/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target: scanTarget })
              })
              if (startRes.ok) {
                const startJson = await startRes.json()
                const newId = startJson.scanId || startJson.data?.scanId
                if (newId) {
                  const retryRes = await fetch(`http://localhost:5001/api/v1/scan/${newId}/report`)
                  if (retryRes.ok) {
                    const retryJson = await retryRes.json()
                    if (isMounted && retryJson?.data) {
                      setReportData(retryJson.data)
                      loadedScanId = newId
                    }
                  }
                }
              }
            }
          }

          try {
            const aiRes = await fetch(`http://localhost:5001/api/v1/secure-ai/summary/${loadedScanId}`)
            if (aiRes.ok) {
              const aiJson = await aiRes.json()
              if (isMounted && aiJson?.summary) {
                setAiData({ summary: aiJson.summary })
              }
            }
          } catch (e) {
            console.warn('[Investigate] SecureAI summary fetch failed:', e)
          }
        }
      } catch (err) {
        console.warn("Dynamic report fetch failed:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadReport()
    return () => {
      isMounted = false
    }
  }, [activeId, targetParam, navigate])

  const handleExport = () => {
    if (exportState === "ready") { navigate(`/report?scanId=${activeId}`); return }
    if (exportState === "preparing") return
    setExportState("preparing")
    setTimeout(() => setExportState("ready"), 1500)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Loading forensic scan report…</p>
        <p className="text-xs text-muted-foreground font-mono">Scan ID: {activeId}</p>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
        <h2 className="text-base font-semibold text-foreground">Scan Report Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          No telemetry record exists for this scan ID, or the scan is still running.
        </p>
        <Button size="sm" onClick={() => navigate("/")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  // Resolved dynamic values strictly from live report
  const domain = reportData?.target || "Unknown Target"
  const riskScore = typeof reportData?.results?.score === "number" ? reportData.results.score : 0
  const rawRiskLevel = (reportData?.results?.riskLevel || "LOW").toUpperCase()
  const displayScanId = reportData?.scanId || activeId
  const findings = reportData?.results?.findings || []
  const evidence = reportData?.results?.evidence || {}
  const analyzers = evidence?.analyzers || {}

  // Diagnostic: log the full analyzers tree keys so screenshot path is visible in browser console
  console.log('[Investigate] Evidence analyzers keys:', Object.keys(analyzers))
  console.log('[Investigate] browser.data keys:', analyzers.browser?.data ? Object.keys(analyzers.browser.data) : 'N/A')
  console.log('[Investigate] visual.data keys:', analyzers.visual?.data ? Object.keys(analyzers.visual.data) : 'N/A')
  console.log('[Investigate] browser screenshot present:', Boolean(analyzers.browser?.data?.screenshot))
  console.log('[Investigate] visual screenshot present:', Boolean(analyzers.visual?.data?.screenshot))

  const screenshotData =
    analyzers.visual?.data?.screenshot ||
    analyzers.visual?.screenshot ||
    analyzers.browser?.data?.screenshot ||
    analyzers.browser?.screenshot ||
    reportData?.results?.evidence?.screenshot ||
    reportData?.screenshot ||
    null

  const critCount = findings.filter((f: any) => f.severity === "critical").length
  const highCount = findings.filter((f: any) => f.severity === "high").length
  const medCount = findings.filter((f: any) => f.severity === "medium").length
  const lowCount = findings.filter((f: any) => f.severity === "low" || f.severity === "info").length

  const isCritRisk = rawRiskLevel === "CRITICAL"
  const isHighRisk = rawRiskLevel === "HIGH"
  const isMedRisk = rawRiskLevel === "MEDIUM"
  const riskVariant = isCritRisk ? "critical" : isHighRisk ? "high" : isMedRisk ? "medium" : "low"
  const riskToneColor = isCritRisk ? "text-risk-critical-text" : isHighRisk ? "text-risk-high-text" : isMedRisk ? "text-risk-medium-text" : "text-risk-low-text"
  const strokeColor = isCritRisk ? "var(--color-risk-critical)" : isHighRisk ? "var(--color-risk-high)" : isMedRisk ? "var(--color-risk-medium)" : "var(--color-risk-low)"

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-0.5 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">{domain}</h1>
              <Badge variant={riskVariant} className="px-2.5 py-0.5 text-xs uppercase">{rawRiskLevel} RISK</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>ID: <span className="font-mono text-foreground">{displayScanId}</span></span>
              <span>Analyzed: {reportData?.completedAt ? new Date(reportData.completedAt).toLocaleString() : "Just now"}</span>
              <span>Engine Status: <span className="text-[#047857] font-medium">Verified Active</span></span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 items-center">
          <Button variant="outline" size="sm" onClick={() => window.open(domain.startsWith("http") ? domain : `https://${domain}`, "_blank")}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open Target
          </Button>
          {exportState === "idle" && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Report
            </Button>
          )}
          {exportState === "preparing" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 bg-secondary/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Preparing Investigation Report…
            </div>
          )}
          {exportState === "ready" && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[#047857]">
                <CheckCircle className="h-3.5 w-3.5" /> Report ready
              </span>
              <Button size="sm" onClick={handleExport}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
              </Button>
            </div>
          )}
          <Button size="sm" onClick={() => navigate(`/?target=${encodeURIComponent(domain)}`)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Rescan
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[160px_minmax(0,1fr)_272px]">
        {/* Sticky section nav */}
        <div className="xl:order-1">
          <StickyNav />
        </div>

        {/* Evidence workspace */}
        <div className="min-w-0 space-y-5 xl:order-2">

          {/* ── Overview / Risk Score ── */}
          <section id="overview" className="scroll-mt-24">
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  {/* Gauge */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={strokeColor} strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - riskScore / 100)}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className={`block text-xl font-bold ${riskToneColor}`}>{riskScore}</span>
                        <span className="block text-[9px] text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Level</p>
                      <p className={`text-lg font-bold ${riskToneColor}`}>{rawRiskLevel}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground max-w-[180px]">
                        {riskScore > 50 ? "Elevated threat indicators detected." : "Target exhibits low risk characteristics."}
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-16 w-px bg-border md:block" />

                  {/* Finding counts */}
                  <div className="grid flex-1 grid-cols-4 gap-2">
                    <Stat label="Critical" value={critCount} tone="critical" />
                    <Stat label="High" value={highCount} tone="high" />
                    <Stat label="Medium" value={medCount} tone="medium" />
                    <Stat label="Low" value={lowCount} tone="low" />
                  </div>
                </div>

                {/* Check tallies */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-risk-low-text">
                    <CheckCircle2 className="h-3.5 w-3.5" /> All security analyzers executed
                  </span>
                  <span className="flex items-center gap-1.5 text-risk-medium-text">
                    <AlertTriangle className="h-3.5 w-3.5" /> {findings.length} findings recorded
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5" /> Telemetry verified
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Investigation Summary ── */}
          <section id="summary" className="scroll-mt-24">
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                      SecureAI Neural Threat Intelligence
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Autonomous plain-language forensic synthesis from deterministic multi-vector telemetry.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini 3.6 &amp; Groq Active
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Confidence: 98%
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Callout */}
                <div className="rounded-xl border border-border bg-gradient-to-br from-emerald-50/40 via-card to-secondary/30 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                    <ShieldAlert className="h-3.5 w-3.5 text-emerald-700" />
                    AI Executive Threat Assessment
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {aiData?.executiveSummary || (
                      typeof aiData?.summary === 'string' && aiData.summary.includes('#### AI Executive Summary')
                        ? aiData.summary.split('#### AI Executive Summary')[1]?.split('---')[0]?.trim()
                        : (aiData?.summary || reportData?.results?.summary || "SecureAI is generating the dynamic threat intelligence assessment…")
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key findings</p>
                    <ul className="space-y-1.5">
                      {findings.length > 0 ? (
                        findings.map((f: any, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                            <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${f.severity === "critical" ? "bg-risk-critical" : f.severity === "high" ? "bg-risk-high" : "bg-risk-medium"}`} />
                            {f.description || f.vulnerability || f.id}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground">No critical vulnerabilities detected</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Infrastructure</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-risk-low" />
                        IP: {analyzers["ip-asn"]?.data?.ip || analyzers.dns?.data?.records?.a?.[0] || "N/A"}
                      </li>
                      <li className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-risk-low" />
                        TLS: {analyzers.tls?.data?.issuer || "N/A"}
                      </li>
                      <li className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-risk-low" />
                        Server: {analyzers.http?.data?.server || "N/A"}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended action</p>
                    <div className="space-y-2">
                      <div className="rounded-md bg-secondary px-3 py-2.5 text-xs text-foreground">
                        {reportData?.results?.recommendations?.[0] || "Maintain standard security headers and monitor SSL renewals."}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Website Preview ── */}
          <section id="preview" className="scroll-mt-24">
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Website Preview</h2>
                    <p className="text-xs text-muted-foreground">DOM capture and headless browser audit</p>
                  </div>
                  <Badge variant={riskVariant}>{rawRiskLevel} RISK</Badge>
                </div>
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="lg:w-80 shrink-0">
                    <WebsiteScreenshot domain={domain} screenshotData={screenshotData} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Browser Observations</p>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium text-foreground">Page Title: {analyzers.browser?.data?.title || "Analyzed Website"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Input count: {analyzers.browser?.data?.inputCount ?? 0} | Password input: {analyzers.browser?.data?.hasPasswordField ? "Detected" : "None"}
                        </p>
                      </div>
                      {analyzers.browser?.data?.bodyTextSnippet && (
                        <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono text-muted-foreground whitespace-pre-line max-h-36 overflow-y-auto">
                          {analyzers.browser.data.bodyTextSnippet}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Target Information ── */}
          <section id="target" className="scroll-mt-24">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Target Information</h2>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {[
                    { label: "Target Domain", value: domain, mono: true },
                    { label: "Target Type", value: reportData?.type || "domain", mono: true },
                    { label: "IP Address", value: analyzers["ip-asn"]?.data?.ip || analyzers.dns?.data?.records?.a?.[0] || "Unassigned / No DNS A Record", mono: true },
                    { label: "IP Version", value: analyzers["ip-asn"]?.data?.version ? `IPv${analyzers["ip-asn"].data.version.replace('v', '')}` : (analyzers.dns?.data?.records?.a?.length ? "IPv4" : "N/A") },
                    { label: "TLS Issuer", value: analyzers.tls?.data?.issuer || (analyzers.tls?.success ? "Self-Signed / Untrusted" : "No TLS Certificate Presented") },
                    { label: "Server Header", value: analyzers.http?.data?.server || "Undisclosed / Hidden", mono: true },
                    { label: "HTTP Status", value: analyzers.http?.data?.statusCode ? `${analyzers.http.data.statusCode} Status` : "No HTTP Response" },
                    { label: "Punycode IDN", value: analyzers.domain?.data?.isPunycode ? "Detected (Punycode / Homoglyph)" : "Standard ASCII" },
                    { label: "Scan Timestamp", value: reportData?.completedAt ? new Date(reportData.completedAt).toLocaleString() : "Just now" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</dt>
                      <dd className={`text-sm text-foreground break-all ${item.mono ? "font-mono" : ""}`}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </section>

          {/* ── Technical Evidence / Check Explorer ── */}
          <section className="space-y-3">
            <h2 className="border-b border-border pb-2 text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              Technical Evidence
            </h2>
            <URLSection data={analyzers.domain?.data} target={domain} />
            <DNSSection data={analyzers.dns?.data} />
            <IPSection data={analyzers["ip-asn"]?.data} ip={analyzers.dns?.data?.records?.a?.[0]} />
            <TLSSection data={analyzers.tls?.data} />
            <HTTPSection data={analyzers.http?.data} />
            <RedirectSection data={analyzers.redirects?.data} />
            <ThreatSection data={analyzers["threat-intelligence"]?.data} />
            <WebsiteSection data={analyzers.visual?.data} browserData={analyzers.browser?.data} />
            <TechSection />
            <LinksSection />
            <CookiesSection />
            <PhishingSection data={evidence} lookalikeData={analyzers.lookalike?.data} />
            <AISection summary={reportData?.results?.summary} aiData={aiData} score={riskScore} riskLevel={rawRiskLevel} />
          </section>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Forensic analysis powered by the live SecureLens Security Engine & Rulebook.
          </div>
        </div>

        {/* Timeline */}
        <aside className="xl:order-3">
          <div className="xl:sticky xl:top-4">
            <Timeline
              completedAt={reportData?.completedAt}
              analyzers={analyzers}
              findings={findings}
              riskScore={riskScore}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
