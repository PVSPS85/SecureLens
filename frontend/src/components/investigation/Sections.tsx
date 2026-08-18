import React from "react"
import {
  ArrowDown,
  Bot,
  Check,
  X as XIcon,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "../ui/Card"
import {
  EvidenceSection,
  DataGrid,
  SectionSubhead,
  StatusPill,
} from "./primitives"
import type { CheckStatus } from "./data"

/* ---------------------------------- URL ---------------------------------- */
export function URLSection() {
  return (
    <EvidenceSection
      id="url"
      title="URL Analysis"
      status="suspicious"
      description="Lookalike keywords and deceptive structure detected"
    >
      <DataGrid
        items={[
          { label: "Submitted URL", value: "http://suspicious-login-update.net/verify", mono: true },
          { label: "Effective URL", value: "https://login-example.net/account/verify", mono: true },
          { label: "Scheme", value: "HTTP → HTTPS (upgraded)" },
          { label: "Path depth", value: "2 segments" },
          { label: "Query parameters", value: "?session=…&ref=email", mono: true },
          { label: "Lookalike keywords", value: "login, update, verify, account" },
        ]}
      />
      <div className="mt-5 rounded-lg bg-risk-high-bg/60 p-4 text-sm text-risk-high-text">
        The hostname combines the brand-adjacent keywords <b>login</b> and{" "}
        <b>update</b> with a non-brand TLD, a common phishing pattern.
      </div>
    </EvidenceSection>
  )
}

/* ---------------------------------- DNS ---------------------------------- */
function RecordTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/70 text-left">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DNSSection() {
  return (
    <EvidenceSection
      id="dns"
      title="DNS Analysis"
      status="warning"
      description="Nameservers changed 2 days ago"
    >
      <div className="space-y-6">
        <div>
          <SectionSubhead>Records</SectionSubhead>
          <RecordTable
            headers={["Type", "Value", "TTL"]}
            rows={[
              ["A", <span className="font-mono">185.199.108.153</span>, "300"],
              ["AAAA", <span className="font-mono">2606:50c0:8000::153</span>, "300"],
              ["MX", <span className="font-mono">mail.login-example.net</span>, "3600"],
              ["NS", <span className="font-mono">ns1.fast-dns-host.com</span>, "86400"],
              ["TXT", <span className="font-mono">v=spf1 include:_spf.host ~all</span>, "3600"],
              ["CNAME", <span className="font-mono">cdn.fast-dns-host.com</span>, "300"],
            ]}
          />
        </div>
        <DataGrid
          items={[
            { label: "DNS Provider", value: "Fast-DNS-Host (budget registrar)" },
            { label: "Recent DNS changes", value: "Nameservers rotated 2 days ago" },
            {
              label: "Suspicious observations",
              value: "Low TTL + recent NS change consistent with fast-flux hosting",
            },
          ]}
        />
      </div>
    </EvidenceSection>
  )
}

/* -------------------------------- IP / ASN ------------------------------- */
export function IPSection() {
  return (
    <EvidenceSection
      id="ip"
      title="IP / ASN Intelligence"
      status="suspicious"
      description="Bulletproof-adjacent hosting; 41 related domains"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "IP Address", value: "185.199.108.153", mono: true },
          { label: "Country", value: "Netherlands (NL)" },
          { label: "Region", value: "Noord-Holland" },
          { label: "ASN", value: "AS200000", mono: true },
          { label: "Organization", value: "Rapid Cloud Networks B.V." },
          { label: "Hosting provider", value: "RapidVPS" },
          { label: "Cloud provider", value: "Self-hosted / VPS" },
          { label: "Reputation", value: "Elevated abuse reports (30d)" },
          { label: "Related domains", value: "41 on same /24" },
        ]}
      />
      <div className="mt-5">
        <SectionSubhead>Infrastructure relationships</SectionSubhead>
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-4 text-sm">
          {["login-example.net", "verify-account.net", "secure-update.net", "+38 more"].map(
            (d) => (
              <span
                key={d}
                className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground"
              >
                {d}
              </span>
            ),
          )}
        </div>
      </div>
    </EvidenceSection>
  )
}

/* ---------------------------------- TLS ---------------------------------- */
export function TLSSection() {
  return (
    <EvidenceSection
      id="tls"
      title="TLS / SSL Certificate"
      status="pass"
      description="Valid certificate, hostname matches"
    >
      <DataGrid
        columns={2}
        items={[
          { label: "HTTPS status", value: "Enabled" },
          { label: "TLS version", value: "TLS 1.3" },
          { label: "Certificate issuer", value: "Let's Encrypt R3" },
          { label: "Certificate subject", value: "CN=login-example.net", mono: true },
          { label: "Valid from", value: "Jul 30, 2026" },
          { label: "Valid until", value: "Oct 28, 2026" },
          { label: "Days remaining", value: "78 days" },
          { label: "Hostname match", value: "Matches" },
          { label: "Certificate status", value: "Trusted chain" },
          { label: "Certificate transparency", value: "Logged (2 SCTs)" },
        ]}
      />
      <div className="mt-5 rounded-lg bg-risk-medium-bg/60 p-4 text-sm text-risk-medium-text">
        A valid certificate does not imply legitimacy — free certificates are
        routinely issued to phishing domains within minutes of registration.
      </div>
    </EvidenceSection>
  )
}

/* ---------------------------------- HTTP --------------------------------- */
function HeaderRow({
  name,
  state,
}: {
  name: string
  state: "present" | "missing" | "warning"
}) {
  const map = {
    present: { icon: Check, cls: "text-risk-low-text", label: "Present" },
    warning: { icon: AlertTriangle, cls: "text-risk-medium-text", label: "Warning" },
    missing: { icon: XIcon, cls: "text-risk-critical-text", label: "Missing" },
  } as const
  const { icon: Icon, cls, label } = map[state]
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0">
      <span className="font-mono text-sm text-foreground">{name}</span>
      <span className={cn("flex items-center gap-1.5 text-sm font-medium", cls)}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
    </div>
  )
}

export function HTTPSection() {
  return (
    <EvidenceSection
      id="http"
      title="HTTP Analysis"
      status="high"
      description="3 critical security headers missing"
    >
      <div className="space-y-6">
        <DataGrid
          columns={3}
          items={[
            { label: "Status code", value: "200 OK" },
            { label: "HTTP version", value: "HTTP/2" },
            { label: "Protocol", value: "h2" },
            { label: "Server", value: "nginx/1.25.3", mono: true },
            { label: "Content type", value: "text/html; charset=utf-8", mono: true },
            { label: "Response size", value: "48.2 KB" },
            { label: "Response time", value: "312 ms" },
            { label: "Request method", value: "GET" },
            { label: "Compression", value: "gzip" },
          ]}
        />
        <div>
          <SectionSubhead>Security headers</SectionSubhead>
          <div className="rounded-lg border border-border px-4">
            <HeaderRow name="Content-Security-Policy" state="missing" />
            <HeaderRow name="Strict-Transport-Security" state="missing" />
            <HeaderRow name="X-Frame-Options" state="warning" />
            <HeaderRow name="X-Content-Type-Options" state="present" />
            <HeaderRow name="Referrer-Policy" state="missing" />
            <HeaderRow name="Permissions-Policy" state="warning" />
          </div>
        </div>
      </div>
    </EvidenceSection>
  )
}

/* -------------------------------- REDIRECTS ------------------------------ */
function RedirectHop({
  url,
  status,
  crossDomain,
  last,
}: {
  url: string
  status?: string
  crossDomain?: boolean
  last?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-full max-w-lg rounded-lg border px-4 py-3 text-center font-mono text-sm",
          crossDomain
            ? "border-risk-high bg-risk-high-bg/50 text-risk-high-text"
            : "border-border bg-card text-foreground",
        )}
      >
        {url}
        {crossDomain && (
          <span className="ml-2 rounded bg-risk-high-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase not-italic">
            cross-domain
          </span>
        )}
      </div>
      {!last && (
        <div className="flex flex-col items-center py-1 text-muted-foreground">
          <ArrowDown className="h-4 w-4" />
          {status && (
            <span className="text-xs font-semibold text-muted-foreground">
              {status}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function RedirectSection() {
  return (
    <EvidenceSection
      id="redirects"
      title="Redirect Analysis"
      status="suspicious"
      description="Suspicious cross-domain redirect in 3-hop chain"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Number of redirects", value: "3" },
          { label: "Cross-domain hops", value: "1" },
          { label: "Final status", value: "200 OK" },
        ]}
      />
      <div className="mt-6">
        <SectionSubhead>Redirect chain</SectionSubhead>
        <div className="space-y-0">
          <RedirectHop url="http://suspicious-login-update.net" status="301" />
          <RedirectHop url="https://suspicious-login-update.net" status="302" />
          <RedirectHop
            url="https://login-example.net/verify"
            status="200 OK"
            crossDomain
          />
          <RedirectHop url="Final destination reached" last />
        </div>
      </div>
    </EvidenceSection>
  )
}

/* ----------------------------- THREAT INTEL ------------------------------ */
function IntelCard({
  source,
  verdict,
  status,
  detail,
}: {
  source: string
  verdict: string
  status: CheckStatus
  detail: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{source}</span>
        <StatusPill status={status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">
        {verdict}
      </p>
    </Card>
  )
}

export function ThreatSection() {
  return (
    <EvidenceSection
      id="threat"
      title="Threat Intelligence"
      status="critical"
      description="Matched 2 phishing/malware feeds"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <IntelCard
          source="Google Safe Browsing"
          verdict="No match"
          status="pass"
          detail="Not currently listed. Newly registered domains often precede listing."
        />
        <IntelCard
          source="PhishTank Feed"
          verdict="Confirmed phishing"
          status="critical"
          detail="Reported 6 hours ago · confidence 91% · credential harvesting."
        />
        <IntelCard
          source="OpenThreat Feed"
          verdict="Suspicious"
          status="suspicious"
          detail="Domain clustered with known kit infrastructure · confidence 74%."
        />
        <IntelCard
          source="Community Blocklist"
          verdict="Malicious"
          status="high"
          detail="Listed on 3 community blocklists in the last 30 days."
        />
      </div>
      <div className="mt-4">
        <SectionSubhead>Related indicators</SectionSubhead>
        <div className="flex flex-wrap gap-2">
          {["185.199.108.153", "phish_kit_v7", "login-example.net", "verify-account.net"].map(
            (i) => (
              <span
                key={i}
                className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-foreground"
              >
                {i}
              </span>
            ),
          )}
        </div>
      </div>
    </EvidenceSection>
  )
}

/* ------------------------------- WEBSITE --------------------------------- */
export function WebsiteSection() {
  return (
    <EvidenceSection
      id="website"
      title="Website / Page Analysis"
      status="high"
      description="Login form with password field and external submission"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Page title", value: "Verify your account" },
          { label: "Forms detected", value: "1" },
          { label: "Login forms", value: "1" },
          { label: "Password fields", value: "1" },
          { label: "Iframes", value: "0" },
          { label: "External scripts", value: "4" },
          { label: "Downloads", value: "0" },
          { label: "Embedded resources", value: "12" },
          { label: "Page size", value: "48.2 KB" },
        ]}
      />
      <div className="mt-5 rounded-lg bg-risk-high-bg/60 p-4 text-sm text-risk-high-text">
        A login form submits credentials to a different origin than the page is
        served from — a strong credential-harvesting indicator.
      </div>
    </EvidenceSection>
  )
}

/* ----------------------------- TECHNOLOGIES ------------------------------ */
export function TechSection() {
  const groups: { category: string; items: string[] }[] = [
    { category: "Frontend", items: ["React", "Next.js"] },
    { category: "Web Server", items: ["Nginx"] },
    { category: "CDN", items: ["Cloudflare"] },
    { category: "Analytics", items: ["Google Analytics"] },
    { category: "Framework", items: ["Tailwind CSS"] },
  ]
  return (
    <EvidenceSection
      id="tech"
      title="Technology Detection"
      status="pass"
      description="6 technologies detected across 5 categories"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.category} className="rounded-lg border border-border p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-2.5 py-1 text-sm text-foreground"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </EvidenceSection>
  )
}

/* -------------------------------- LINKS ---------------------------------- */
export function LinksSection() {
  return (
    <EvidenceSection
      id="links"
      title="Link Analysis"
      status="warning"
      description="18 external links across 4 domains"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Total links", value: "34" },
          { label: "Internal links", value: "16" },
          { label: "External links", value: "18" },
          { label: "Suspicious links", value: "3" },
          { label: "External domains", value: "4" },
          { label: "Broken links", value: "1" },
        ]}
      />
      <div className="mt-5">
        <SectionSubhead>Notable links</SectionSubhead>
        <RecordTable
          headers={["URL", "Type", "Domain", "Risk", "Status"]}
          rows={[
            [
              <span className="font-mono text-xs">/account/verify</span>,
              "Internal",
              "login-example.net",
              <StatusPill status="warning" />,
              "200",
            ],
            [
              <span className="font-mono text-xs">https://cdn.fast-dns-host.com/…</span>,
              "External",
              "fast-dns-host.com",
              <StatusPill status="suspicious" />,
              "200",
            ],
            [
              <span className="font-mono text-xs">https://track.ads-metrics.io/…</span>,
              "External",
              "ads-metrics.io",
              <StatusPill status="high" />,
              "302",
            ],
          ]}
        />
      </div>
    </EvidenceSection>
  )
}

/* -------------------------------- COOKIES -------------------------------- */
export function CookiesSection() {
  return (
    <EvidenceSection
      id="cookies"
      title="Cookies & Tracking"
      status="warning"
      description="5 third-party trackers detected"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Total cookies", value: "11" },
          { label: "First-party", value: "4" },
          { label: "Third-party", value: "7" },
          { label: "Tracking services", value: "5" },
          { label: "Third-party domains", value: "6" },
          { label: "Session cookies", value: "3" },
        ]}
      />
      <div className="mt-5">
        <SectionSubhead>Tracking services</SectionSubhead>
        <div className="flex flex-wrap gap-2">
          {["Google Analytics", "Meta Pixel", "ads-metrics.io", "Hotjar", "TikTok Pixel"].map(
            (t) => (
              <span
                key={t}
                className="rounded-md bg-muted px-2.5 py-1 text-sm text-foreground"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </div>
    </EvidenceSection>
  )
}

/* ------------------------------- PHISHING -------------------------------- */
export function PhishingSection() {
  const indicators = [
    "Brand keyword in domain",
    "Login page detected",
    "Visual similarity to brand login",
    "Recently registered domain (12 days)",
    "Suspicious cross-domain redirect",
    "Credential submission to foreign origin",
  ]
  return (
    <EvidenceSection
      id="phishing"
      title="Brand Impersonation & Phishing"
      status="critical"
      description="Possible PayPal impersonation · 94% similarity"
      defaultOpen
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <div className="rounded-xl border border-risk-critical-bg bg-risk-critical-bg/40 p-5 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-risk-critical-text" />
            <p className="mt-2 text-sm font-semibold text-risk-critical-text">
              Possible PayPal impersonation
            </p>
            <p className="mt-3 text-4xl font-bold text-risk-critical-text">94%</p>
            <p className="text-xs uppercase tracking-wider text-risk-critical-text/80">
              Visual similarity
            </p>
          </div>
        </div>
        <div className="flex-1">
          <SectionSubhead>Indicators</SectionSubhead>
          <ul className="space-y-2">
            {indicators.map((ind) => (
              <li
                key={ind}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-risk-critical-bg">
                  <Check className="h-3 w-3 text-risk-critical-text" />
                </span>
                {ind}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </EvidenceSection>
  )
}

/* ------------------------------ SECUREAI --------------------------------- */
export function AISection() {
  const supportingEvidence = [
    "Lookalike domain combining 'login', 'update' keywords with non-brand TLD",
    "Domain registered 3 days prior to investigation — consistent with disposable phishing infrastructure",
    "Login form submits credentials to external IP 185.199.108.153, not to the impersonated brand",
    "Brand impersonation score: 94% visual similarity to PayPal identity",
    "Host AS200000 (RapidVPS) has elevated abuse reports and 41 related suspicious domains",
    "Confirmed match on PhishTank feed (confidence 91%) and Community Blocklist (3 sources)",
    "Missing Content-Security-Policy, HSTS, and Referrer-Policy security headers",
  ]

  return (
    <EvidenceSection
      id="ai"
      title="SecureAI Analysis"
      status="critical"
      description="AI interpretation of the collected evidence"
      defaultOpen
    >
      <div className="space-y-4">
        {/* Assessment header */}
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
            <Bot className="h-4 w-4 text-accent" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SecureAI Assessment Engine</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">Overall assessment: <span className="text-risk-critical-text">Critical Risk</span></p>
          </div>
        </div>

        {/* Assessment grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reasoning</p>
            <p className="text-xs text-foreground leading-relaxed">
              This site exhibits a strong, consistent pattern of credential-harvesting phishing infrastructure targeting a well-known financial brand. The convergence of freshly registered lookalike domain, foreign credential submission, and multiple threat feed matches makes malicious intent highly probable.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Confidence</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-risk-critical-text">High</span>
              <span className="text-xs text-muted-foreground">91%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-risk-critical h-1.5 rounded-full" style={{ width: "91%" }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Based on 7 converging indicators across threat feeds, infrastructure analysis, and visual fingerprinting.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended action</p>
            <p className="text-xs font-semibold text-risk-critical-text mb-2">Do not interact with this website or submit credentials.</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>→ Block at network/DNS level</li>
              <li>→ Submit to anti-phishing registries</li>
              <li>→ Alert users who received this link</li>
            </ul>
          </div>
        </div>

        {/* Supporting evidence */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Supporting evidence</p>
          <ol className="space-y-1.5">
            {supportingEvidence.map((f, i) => (
              <li key={f} className="flex items-start gap-3 text-xs text-foreground">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mt-0.5">
                  {i + 1}
                </span>
                {f}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </EvidenceSection>
  )
}
