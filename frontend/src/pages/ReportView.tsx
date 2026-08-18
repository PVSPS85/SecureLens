import React from "react"
import { useNavigate } from "react-router"
import {
  ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon,
  CheckCircle2, Lock, Eye, Printer, ArrowLeft, Bot,
} from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"
import { TECHNICAL_EVIDENCE } from "../lib/mockData"

/* ─── shared constants ─── */
const INVESTIGATION_ID = "SL-INV-000142"
const DOMAIN           = "suspicious-login-update.net"
const RISK_SCORE       = 98
const GENERATED        = "Aug 11, 2026 · 12:42 UTC"

/* ─── phishing page mockup (visual evidence) ─── */
function PhishingMockup() {
  return (
    <div
      className="rounded-lg overflow-hidden border border-border bg-white select-none text-left"
      style={{ fontFamily: "system-ui, sans-serif", maxWidth: 320 }}
    >
      <div className="flex items-center gap-2 bg-[#f1f3f4] border-b border-[#dadce0] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 items-center gap-1 bg-white rounded border border-[#dadce0] px-2 py-0.5 mx-2">
          <Lock className="h-2 w-2 text-[#5f6368]" />
          <span className="text-[9px] text-[#202124] truncate">{DOMAIN}/verify</span>
        </div>
      </div>
      <div className="p-4 bg-[#f8faff]">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div className="h-5 w-5 rounded bg-[#003087] flex items-center justify-center">
            <span className="text-white font-bold text-[9px]">P</span>
          </div>
          <span className="text-[#003087] font-bold text-xs">PayPal</span>
        </div>
        <p className="text-center text-[10px] text-[#333] font-semibold mb-3">Verify your account to continue</p>
        <div className="space-y-2 max-w-[180px] mx-auto">
          <div>
            <label className="text-[8px] text-[#6c6c6c] block mb-0.5">Email or phone number</label>
            <div className="border border-[#bfc2c7] rounded px-2 py-1 bg-white text-[9px] text-[#aaa]">user@example.com</div>
          </div>
          <div>
            <label className="text-[8px] text-[#6c6c6c] block mb-0.5">Password</label>
            <div className="border border-[#bfc2c7] rounded px-2 py-1 bg-white text-[9px] text-[#aaa] flex justify-between items-center">
              <span>••••••••</span>
              <Eye className="h-2 w-2 text-[#aaa]" />
            </div>
          </div>
          <div className="bg-[#0070ba] rounded text-white text-[9px] font-semibold text-center py-1">Log In</div>
        </div>
      </div>
      <div className="bg-risk-critical-bg border-t border-risk-critical/30 px-3 py-1.5 flex items-center gap-1.5">
        <AlertOctagon className="h-3 w-3 text-risk-critical-text shrink-0" />
        <span className="text-[9px] font-semibold text-risk-critical-text">Credential harvesting form detected</span>
      </div>
    </div>
  )
}

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
    PASS:       "bg-risk-low-bg text-risk-low-text",
    WARNING:    "bg-risk-medium-bg text-risk-medium-text",
    SUSPICIOUS: "bg-risk-high-bg text-risk-high-text",
    HIGH:       "bg-risk-high-bg text-risk-high-text",
    CRITICAL:   "bg-risk-critical-bg text-risk-critical-text",
  }
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2 pr-4 text-xs font-medium text-foreground whitespace-nowrap">{check}</td>
      <td className="py-2 pr-4">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", pill[status])}>{status}</span>
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

/* ─── main component ─── */
export function ReportView() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-6 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Toolbar (non-printed) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4 flex-wrap px-4 sm:px-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/investigate")}>
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
              <p>ID: <span className="font-mono text-white">{INVESTIGATION_ID}</span></p>
              <p>Generated: <span className="text-white">{GENERATED}</span></p>
              <p>Status: <span className="text-[#10B981] font-medium">Completed</span></p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-0">

          {/* ── Target ── */}
          <Section title="Target">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {[
                { label: "Submitted URL",   value: "http://suspicious-login-update.net/verify", mono: true },
                { label: "Effective URL",   value: "https://login-example.net/account/verify",  mono: true },
                { label: "Domain",          value: DOMAIN,                                       mono: true },
                { label: "IP Address",      value: "185.199.108.153",                            mono: true },
                { label: "Country",         value: "Netherlands (NL)" },
                { label: "Hosting Provider",value: "RapidVPS / Rapid Cloud Networks" },
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
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#EF4444" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - RISK_SCORE / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-risk-critical-text">{RISK_SCORE}</span>
                    <span className="text-[9px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <Badge variant="critical" className="mb-1">CRITICAL RISK</Badge>
                  <p className="text-xs text-muted-foreground max-w-[180px]">Strong evidence of a credential-harvesting phishing page impersonating a financial brand.</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Critical", value: 4, cls: "text-risk-critical-text bg-risk-critical-bg" },
                  { label: "High",     value: 3, cls: "text-risk-high-text bg-risk-high-bg" },
                  { label: "Medium",   value: 2, cls: "text-risk-medium-text bg-risk-medium-bg" },
                  { label: "Low",      value: 1, cls: "text-risk-low-text bg-risk-low-bg" },
                ].map(f => (
                  <div key={f.label} className={cn("rounded-lg px-3 py-2.5 text-center", f.cls + "/40")}>
                    <p className={cn("text-xl font-bold tabular-nums", f.cls.split(" ")[0])}>{f.value}</p>
                    <p className="text-[10px] text-muted-foreground">{f.label} findings</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-risk-low-text"><CheckCircle2 className="h-3.5 w-3.5" />18 checks completed</span>
              <span className="flex items-center gap-1.5 text-risk-medium-text"><AlertTriangle className="h-3.5 w-3.5" />5 warnings</span>
              <span className="flex items-center gap-1.5 text-risk-critical-text"><AlertOctagon className="h-3.5 w-3.5" />2 checks failed</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><ShieldAlert className="h-3.5 w-3.5" />21 total checks</span>
            </div>
          </Section>

          {/* ── Investigation Summary ── */}
          <Section title="Investigation Summary">
            <div className="rounded-lg border border-risk-critical/20 bg-risk-critical-bg/30 px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-risk-critical-text">This website shows strong indicators of credential harvesting and possible brand impersonation.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Findings</p>
                <ul className="space-y-1.5">
                  {[
                    { text: "Suspicious login form detected",            sev: "critical" },
                    { text: "Brand impersonation indicators (94% match)", sev: "critical" },
                    { text: "Redirect chain contains suspicious hop",    sev: "high"     },
                    { text: "Threat intelligence warning detected",      sev: "high"     },
                    { text: "Missing critical security headers",         sev: "medium"   },
                  ].map(f => (
                    <li key={f.text} className="flex items-start gap-2 text-xs text-foreground">
                      <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", {
                        "bg-risk-critical": f.sev === "critical",
                        "bg-risk-high": f.sev === "high",
                        "bg-risk-medium": f.sev === "medium",
                      })} />
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Action</p>
                <div className="rounded-lg bg-secondary px-4 py-3 text-sm text-foreground mb-2">
                  Do not enter credentials or sensitive information on this website.
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>→ Block domain at network level</li>
                  <li>→ Report to anti-phishing authorities</li>
                  <li>→ Alert users if link was distributed</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ── Website Visual Evidence ── */}
          <Section title="Website Visual Evidence">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <PhishingMockup />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Visual Findings</p>
                <div className="space-y-2">
                  {[
                    { label: "Brand impersonation",      sev: "CRITICAL", detail: "Logo, color scheme and typography match PayPal brand identity at 94% similarity." },
                    { label: "Login form detected",      sev: "CRITICAL", detail: "Form submits credentials to external IP 185.199.108.153 rather than the legitimate domain." },
                    { label: "Suspicious page structure",sev: "HIGH",     detail: "Single-purpose page with no navigation, footer, or legal links — consistent with a phishing kit." },
                    { label: "Urgency language",         sev: "HIGH",     detail: "\"Verify your account to continue\" — social engineering to bypass user scepticism." },
                  ].map(f => {
                    const pillCls = f.sev === "CRITICAL" ? "bg-risk-critical-bg text-risk-critical-text" : "bg-risk-high-bg text-risk-high-text"
                    return (
                      <div key={f.label} className="flex gap-2.5 text-xs">
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold h-fit mt-0.5", pillCls)}>{f.sev}</span>
                        <div>
                          <p className="font-medium text-foreground">{f.label}</p>
                          <p className="text-muted-foreground">{f.detail}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* ── Technical Evidence ── */}
          <Section title="Technical Evidence">
            {TECHNICAL_EVIDENCE.map(section => (
              <div key={section.name} className="mb-6">
                <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                  {section.name}
                </h3>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 text-left">
                        {["Check", "Status", "Value", "Explanation"].map(h => (
                          <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map(r => <EvidenceRow key={r.check} {...r} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Section>

          {/* ── SecureAI Assessment ── */}
          <Section title="SecureAI Assessment">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SecureAI Analysis Engine</p>
                  <p className="text-sm font-semibold text-foreground">Overall Assessment: <span className="text-risk-critical-text">Critical Risk</span></p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
                  <p className="text-lg font-bold text-risk-critical-text">High · 91%</p>
                  <div className="mt-1 h-1.5 rounded-full bg-border">
                    <div className="h-1.5 rounded-full bg-risk-critical" style={{ width: "91%" }} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Reasoning</p>
                  <p className="text-foreground leading-relaxed">
                    This site exhibits a strong, consistent pattern of credential-harvesting phishing infrastructure. The convergence of a freshly registered lookalike domain, a login form submitting to a foreign IP, and multiple threat feed matches makes malicious intent highly probable. The 94% visual similarity to a major financial brand's login page further confirms intentional impersonation.
                  </p>
                </div>
              </div>
              <div className="border-t border-border/60 pt-3">
                <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recommended Action</p>
                <p className="text-sm font-semibold text-risk-critical-text">Do not interact with this website or submit credentials.</p>
              </div>
              <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-3">
                SecureAI explains the investigation evidence. It does not replace the underlying security checks. The risk score is determined by the SecureLens analysis engine.
              </p>
            </div>
          </Section>

          {/* ── Footer ── */}
          <div className="border-t border-border pt-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">SecureLens</span>
              <span>· Security Investigation Report</span>
            </div>
            <div className="space-y-0.5 text-right">
              <p>Investigation ID: <span className="font-mono">{INVESTIGATION_ID}</span></p>
              <p>Generated: {GENERATED}</p>
              <p className="text-[10px]">Prototype / Demo Data — does not represent real security analysis</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
