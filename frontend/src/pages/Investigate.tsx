import React, { useState } from "react"
import { useNavigate } from "react-router"
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
import { DEMO_INVESTIGATION_TARGET } from "../lib/mockData"

// @BACKEND-TODO: Fetch the full investigation report from the backend using the scan ID (e.g., from `useParams()` if you update the routing).
// The backend should return the complete payload needed for all these sections (DNS, IP, TLS, Threat Intel, etc.).
// Replace `DEMO_INVESTIGATION_TARGET` and the mock properties below with the actual fetched data.
const domain = DEMO_INVESTIGATION_TARGET.domain
const riskScore = DEMO_INVESTIGATION_TARGET.riskScore
const scanId = DEMO_INVESTIGATION_TARGET.scanId

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

/* Phishing page mockup — rendered JSX to look like captured screenshot evidence */
function PhishingPageMockup() {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-white select-none" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 bg-[#f1f3f4] border-b border-[#dadce0] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-white rounded border border-[#dadce0] px-2 py-1 mx-2">
          <Lock className="h-2.5 w-2.5 text-[#5f6368]" />
          <span className="text-[10px] text-[#202124] truncate">suspicious-login-update.net/verify</span>
        </div>
      </div>
      {/* Fake page content */}
      <div className="p-5 bg-[#f8faff]">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-6 w-6 rounded bg-[#003087] flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">P</span>
          </div>
          <span className="text-[#003087] font-bold text-sm">PayPal</span>
        </div>
        <p className="text-center text-[11px] text-[#333] font-semibold mb-4">Verify your account to continue</p>
        {/* Form fields */}
        <div className="space-y-2.5 max-w-[220px] mx-auto">
          <div>
            <label className="text-[9px] text-[#6c6c6c] block mb-0.5">Email or phone number</label>
            <div className="border border-[#bfc2c7] rounded px-2 py-1.5 bg-white text-[10px] text-[#aaa]">user@example.com</div>
          </div>
          <div>
            <label className="text-[9px] text-[#6c6c6c] block mb-0.5">Password</label>
            <div className="border border-[#bfc2c7] rounded px-2 py-1.5 bg-white text-[10px] text-[#aaa] flex items-center justify-between">
              <span>••••••••</span>
              <Eye className="h-2.5 w-2.5 text-[#aaa]" />
            </div>
          </div>
          <div className="bg-[#0070ba] rounded text-white text-[10px] font-semibold text-center py-1.5">
            Log In
          </div>
          <p className="text-[8px] text-center text-[#aaa]">By continuing you agree to our Terms of Service</p>
        </div>
      </div>
      {/* Warning overlay strip */}
      <div className="bg-risk-critical-bg border-t border-risk-critical/30 px-3 py-2 flex items-center gap-2">
        <AlertOctagon className="h-3.5 w-3.5 text-risk-critical-text shrink-0" />
        <span className="text-[10px] font-semibold text-risk-critical-text">Credential harvesting form detected — do not interact</span>
      </div>
    </div>
  )
}

export function Investigate() {
  const navigate = useNavigate()
  const [exportState, setExportState] = useState<"idle" | "preparing" | "ready">("idle")

  const handleExport = () => {
    if (exportState === "ready") { navigate("/report"); return }
    if (exportState === "preparing") return
    setExportState("preparing")
    setTimeout(() => setExportState("ready"), 2000)
  }

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
              <Badge variant="critical" className="px-2.5 py-0.5 text-xs">CRITICAL RISK</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>ID: <span className="font-mono text-foreground">{scanId}</span></span>
              <span>First analyzed: Aug 11, 2026 · 12:42</span>
              <span>Last analyzed: Just now</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 items-center">
          <Button variant="outline" size="sm"><ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open URL</Button>
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
          <Button size="sm"><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Rescan</Button>
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
            <Card className="overflow-hidden border-l-4 border-l-risk-critical">
              <CardContent className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  {/* Gauge */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="var(--color-risk-critical)" strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - riskScore / 100)}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="block text-xl font-bold text-risk-critical-text">{riskScore}</span>
                        <span className="block text-[9px] text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Level</p>
                      <p className="text-lg font-bold text-risk-critical-text">Critical</p>
                      <p className="mt-0.5 text-xs text-muted-foreground max-w-[180px]">
                        Strong evidence of a credential-harvesting phishing page.
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-16 w-px bg-border md:block" />

                  {/* Finding counts */}
                  <div className="grid flex-1 grid-cols-4 gap-2">
                    <Stat label="Critical" value={4} tone="critical" />
                    <Stat label="High" value={3} tone="high" />
                    <Stat label="Medium" value={2} tone="medium" />
                    <Stat label="Low" value={1} tone="low" />
                  </div>
                </div>

                {/* Check tallies */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-risk-low-text">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 18 checks completed
                  </span>
                  <span className="flex items-center gap-1.5 text-risk-medium-text">
                    <AlertTriangle className="h-3.5 w-3.5" /> 5 warnings
                  </span>
                  <span className="flex items-center gap-1.5 text-risk-critical-text">
                    <AlertOctagon className="h-3.5 w-3.5" /> 2 checks failed
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5" /> 21 total checks
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Investigation Summary ── */}
          <section id="summary" className="scroll-mt-24">
            <Card className="overflow-hidden border-l-4 border-l-risk-critical">
              <CardContent className="p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-risk-critical-text shrink-0" />
                  Investigation Summary
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Plain-language interpretation of the collected evidence.</p>

                <div className="rounded-lg border border-risk-critical/20 bg-risk-critical-bg/40 px-4 py-3 mb-4">
                  <p className="text-sm font-semibold text-risk-critical-text">
                    This website shows strong indicators of credential harvesting and brand impersonation.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key findings</p>
                    <ul className="space-y-1.5">
                      {[
                        { text: "Suspicious login form detected", sev: "critical" },
                        { text: "Brand impersonation indicators", sev: "critical" },
                        { text: "Redirect chain contains suspicious hop", sev: "high" },
                        { text: "Threat intelligence warning detected", sev: "high" },
                        { text: "Missing critical security headers", sev: "medium" },
                      ].map((f) => (
                        <li key={f.text} className="flex items-start gap-2 text-xs text-foreground">
                          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${f.sev === "critical" ? "bg-risk-critical" : f.sev === "high" ? "bg-risk-high" : "bg-risk-medium"}`} />
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Infrastructure</p>
                    <ul className="space-y-1.5">
                      {[
                        "Domain registered 3 days ago",
                        "Hosted on bulletproof VPS (NL)",
                        "41 related suspicious domains",
                        "No DMARC / SPF misconfigured",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-risk-high" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended action</p>
                    <div className="space-y-2">
                      <div className="rounded-md bg-secondary px-3 py-2.5 text-xs text-foreground">
                        Do not enter credentials or sensitive information on this website.
                      </div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li className="flex gap-1.5">→ Block domain at network level</li>
                        <li className="flex gap-1.5">→ Report to anti-phishing authorities</li>
                        <li className="flex gap-1.5">→ Alert users if link was distributed</li>
                      </ul>
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
                    <p className="text-xs text-muted-foreground">Captured website preview · visual evidence</p>
                  </div>
                  <Badge variant="critical">Phishing detected</Badge>
                </div>
                <div className="flex flex-col gap-5 lg:flex-row">
                  {/* Phishing page mockup */}
                  <div className="lg:w-72 shrink-0">
                    <PhishingPageMockup />
                  </div>
                  {/* Visual findings */}
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Visual Findings</p>
                    <div className="space-y-2">
                      {[
                        { label: "Brand impersonation", detail: "Logo, color scheme and typography match PayPal brand identity at 94% similarity.", sev: "critical" },
                        { label: "Login form detected", detail: "Email and password input fields present. Form action submits to external IP 185.199.108.153.", sev: "critical" },
                        { label: "Suspicious page structure", detail: "Single-purpose page with no navigation, footer, or legal links — consistent with a phishing kit template.", sev: "high" },
                        { label: "Urgency language detected", detail: "\"Verify your account to continue\" — social engineering language designed to bypass user scepticism.", sev: "high" },
                        { label: "Missing trust indicators", detail: "No company address, no support links, no cookie consent, no legal notice.", sev: "medium" },
                      ].map((f) => {
                        const pillCls = f.sev === "critical"
                          ? "bg-risk-critical-bg text-risk-critical-text"
                          : f.sev === "high"
                            ? "bg-risk-high-bg text-risk-high-text"
                            : "bg-risk-medium-bg text-risk-medium-text"
                        const pillLabel = f.sev === "critical" ? "CRITICAL" : f.sev === "high" ? "HIGH" : "MEDIUM"
                        return (
                          <div key={f.label} className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillCls}`}>{pillLabel}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground">{f.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{f.detail}</p>
                            </div>
                          </div>
                        )
                      })}
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
                    { label: "Submitted URL", value: "http://suspicious-login-update.net/verify", mono: true },
                    { label: "Effective URL", value: "https://login-example.net/account/verify", mono: true },
                    { label: "Domain", value: domain, mono: true },
                    { label: "IP Address", value: "185.199.108.153", mono: true },
                    { label: "Country", value: "Netherlands (NL)" },
                    { label: "Hosting Provider", value: "RapidVPS" },
                    { label: "ASN", value: "AS200000 · Rapid Cloud Networks", mono: true },
                    { label: "Server", value: "nginx/1.25.3", mono: true },
                    { label: "Page Title", value: "Verify your account" },
                    { label: "HTTP Status", value: "200 OK" },
                    { label: "HTTPS", value: "Enabled (TLS 1.3)" },
                    { label: "Scan Timestamp", value: "Aug 11, 2026 · 12:42:11" },
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
            <URLSection />
            <DNSSection />
            <IPSection />
            <TLSSection />
            <HTTPSection />
            <RedirectSection />
            <ThreatSection />
            <WebsiteSection />
            <TechSection />
            <LinksSection />
            <CookiesSection />
            <PhishingSection />
            <AISection />
          </section>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            This report uses illustrative demo data. SecureLens does not perform live security checks in this preview.
          </div>
        </div>

        {/* Timeline */}
        <aside className="xl:order-3">
          <div className="xl:sticky xl:top-4">
            <Timeline />
          </div>
        </aside>
      </div>
    </div>
  )
}
