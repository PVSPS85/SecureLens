import React from "react"
import { Shield, Eye, Zap, Lock, CheckCircle, ArrowDown, Info, LogIn, History } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { useNavigate } from "react-router"

/* ─── Chrome extension popup mockup ─── */
function ExtensionPopup() {
  return (
    <div className="rounded-xl border border-border bg-white shadow-xl overflow-hidden" style={{ width: 320 }}>
      {/* Toolbar */}
      <div className="bg-primary px-4 py-3 flex items-center gap-2">
        <Shield className="h-4 w-4 text-accent" />
        <span className="text-sm font-bold text-white">SecureLens</span>
        <span className="ml-auto text-[10px] text-white/50">for Chrome · prototype</span>
      </div>

      {/* Current site */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Checking current website</p>
        <p className="font-mono text-sm text-foreground font-medium truncate">suspicious-login-update.net</p>
      </div>

      {/* Risk score */}
      <div className="px-4 py-3 bg-risk-critical-bg/30 border-b border-border flex items-center gap-4">
        <div className="text-center shrink-0">
          <p className="text-3xl font-bold text-risk-critical-text tabular-nums">98</p>
          <p className="text-[9px] text-muted-foreground">/ 100</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="critical">CRITICAL</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">Strong indicators of credential harvesting and brand impersonation.</p>
        </div>
      </div>

      {/* Key signals */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Signals</p>
        <ul className="space-y-1.5">
          {[
            { label: "Phishing form detected",       sev: "critical" },
            { label: "Brand impersonation (94%)",    sev: "critical" },
            { label: "Suspicious domain age",        sev: "high"     },
            { label: "Threat intelligence match",    sev: "high"     },
          ].map(s => (
            <li key={s.label} className="flex items-center gap-2 text-xs text-foreground">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.sev === "critical" ? "bg-risk-critical" : "bg-risk-high"}`} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Primary CTA */}
      <div className="px-4 py-3">
        <button className="w-full bg-primary text-white text-xs font-semibold rounded-lg py-2.5 hover:bg-primary/90 transition-colors">
          View Full Scan →
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Opens SecureLens for the complete scan report
        </p>
      </div>
    </div>
  )
}

/* ─── Architecture flow ─── */
function ArchitectureDiagram() {
  const steps = [
    { label: "Chrome Extension",      sub: "Lightweight popup"    },
    { label: "Current browser URL",   sub: "Active tab context"   },
    { label: "SecureLens backend",    sub: "Analysis engine"      },
    { label: "Quick risk signal",     sub: "Score + top signals"  },
    { label: "\"View Full Scan\"",    sub: "One click"            },
    { label: "SecureLens web app",    sub: "Full scan report"     },
  ]
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className={`w-full max-w-xs rounded-lg border px-4 py-2.5 text-center ${
            i === 0 || i === steps.length - 1
              ? "bg-primary text-white border-primary"
              : i === 4
              ? "bg-accent/10 border-accent/30"
              : "bg-white border-border"
          }`}>
            <p className={`text-xs font-semibold ${i === 0 || i === steps.length - 1 ? "text-white" : i === 4 ? "text-foreground" : "text-foreground"}`}>{s.label}</p>
            <p className={`text-[10px] ${i === 0 || i === steps.length - 1 ? "text-white/60" : "text-muted-foreground"}`}>{s.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="flex flex-col items-center py-1 text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

const FULL_SCAN_FEATURES = [
  "DNS analysis — registrar, nameservers, TTL, recent changes",
  "IP / ASN intelligence — hosting provider, abuse history, subnet reputation",
  "TLS / SSL certificate inspection — issuer, validity, chain",
  "HTTP analysis — security headers, response codes, server fingerprinting",
  "Redirect chain analysis — full hop-by-hop trace",
  "Threat intelligence — PhishTank, OpenThreat, community blocklists",
  "Website & page analysis — credential forms, scripts, brand similarity",
  "Phishing indicators — visual impersonation, urgency language, payload",
  "SecureAI — investigation-aware analysis with evidence references",
]

export function Extension() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-risk-medium" />
          Prototype concept · Chrome only · not yet available in the Web Store
        </div>
        <h1 className="text-3xl font-bold text-foreground">SecureLens for Chrome</h1>
        <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
          A lightweight security signal for the website you are currently visiting.
          Click through to SecureLens for the complete scan.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button size="lg" onClick={() => alert("Downloading SecureLens Chrome Extension (.crx)...")}>
            <ArrowDown className="mr-2 h-4 w-4" /> Download Extension (.crx)
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/")}>
            Try a scan now →
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Download the .crx file and load it unpacked in Chrome Extensions developer mode.
        </p>
      </div>

      {/* Popup preview + architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Extension popup preview</p>
          <ExtensionPopup />
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Simulated high-risk result. The popup surfaces a quick signal only — the full scan report opens in SecureLens when you click "View Full Scan."
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">How it works</p>
          <ArchitectureDiagram />
          <Card className="mt-6 bg-secondary/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-foreground mb-1">Why lightweight?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The extension intentionally does <strong>not</strong> run the full investigation. It sends only the active tab URL to the SecureLens backend and returns a quick risk signal. Full DNS, TLS, and threat intelligence analysis runs on the SecureLens platform — not in your browser.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Three-step workflow */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Three-step workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "1", title: "Install the Chrome extension",  body: "Add SecureLens to Chrome. The shield icon appears in your toolbar and starts checking pages automatically as you browse." },
            { n: "2", title: "Get an instant risk signal",    body: "A risk badge on the toolbar icon shows the safety level of the page you are visiting. No action required — it runs passively." },
            { n: "3", title: "Open SecureLens for the full scan", body: "Click the popup, then \"View Full Scan\" to open the scan analysis flow in SecureLens and see the complete report." },
          ].map(step => (
            <div key={step.n} className="flex gap-4 items-start p-4 rounded-xl border border-border bg-white">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{step.n}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scan history + login connection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary rounded-lg shrink-0">
                <History className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Scan history &amp; account</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you click "View Full Scan," SecureLens opens and runs the full scan analysis — no login required.
            </p>
            <ul className="space-y-2">
              {[
                { icon: LogIn,   text: "Logged in — scan is saved to your personal Scan History automatically." },
                { icon: Shield,  text: "Guest — you can view the full report freely. Sign in after to save it." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                  {text}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-muted-foreground border-t border-border pt-3">
              Login is never required to perform a scan or view a report.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary rounded-lg shrink-0">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Extension vs. full scan</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Risk score",             ext: true,  web: true  },
                { label: "Top signals (4)",        ext: true,  web: true  },
                { label: "DNS analysis",           ext: false, web: true  },
                { label: "TLS inspection",         ext: false, web: true  },
                { label: "Redirect chain",         ext: false, web: true  },
                { label: "Threat intelligence",    ext: false, web: true  },
                { label: "SecureAI assistant",     ext: false, web: true  },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <span className="flex-1 text-muted-foreground">{row.label}</span>
                  <span className={row.ext ? "text-[#10B981] font-medium" : "text-border"}>Extension</span>
                  <span className={row.web ? "text-[#10B981] font-medium" : "text-border"}>SecureLens</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What the extension does */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">What the extension does</h2>
          <div className="space-y-4">
            {[
              { icon: Eye,    title: "Detects the current website",          body: "Reads the active tab URL and sends it to SecureLens for a quick risk assessment." },
              { icon: Zap,    title: "Returns a lightweight risk signal",    body: "A risk score and top signals in seconds — no full investigation in the browser." },
              { icon: Shield, title: "One click to the full scan report",   body: "\"View Full Scan\" opens SecureLens, runs the analysis animation, and shows the complete report." },
              { icon: Lock,   title: "Does not run the full scan locally",  body: "DNS, TLS, threat intelligence, and phishing analysis all run on the SecureLens platform." },
            ].map(f => (
              <div key={f.title} className="flex gap-3 items-start">
                <div className="p-2 bg-secondary rounded-lg shrink-0 h-fit">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Full scan capabilities</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            The SecureLens web app provides a complete technical scan that the extension cannot replicate:
          </p>
          <div className="space-y-2">
            {FULL_SCAN_FEATURES.map(f => (
              <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/")}>
            Run a full scan →
          </Button>
        </div>
      </div>

      {/* Browser support */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Browser support</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-sm">
            <span>🟡</span>
            <span className="font-medium text-foreground">Google Chrome</span>
            <CheckCircle className="h-3.5 w-3.5 text-[#10B981]" />
          </div>
          <p className="text-sm text-muted-foreground">Chrome is the only supported browser. No other browsers are planned for this prototype.</p>
        </div>
      </div>

      {/* Privacy note */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 flex gap-3">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Privacy &amp; Security</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Only the current page URL is transmitted — no browsing history, form data, or personal information. URLs are processed over TLS and are not stored beyond the analysis request. This is a prototype concept; no real extension currently exists and no data is transmitted in this demo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
