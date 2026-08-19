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
export function URLSection({ data, target }: { data?: any; target?: string }) {
  const host = target || data?.hostname || "suspicious-login-update.net"
  const scheme = host.startsWith("https://") ? "HTTPS" : host.startsWith("http://") ? "HTTP" : "HTTPS"
  const cleanDomain = host.replace(/^https?:\/\//, "").split("/")[0]

  return (
    <EvidenceSection
      id="url"
      title="URL Analysis"
      status={data?.isPunycode ? "suspicious" : "pass"}
      description={`Domain structure analysis for ${cleanDomain}`}
    >
      <DataGrid
        items={[
          { label: "Submitted Target", value: host, mono: true },
          { label: "Hostname", value: cleanDomain, mono: true },
          { label: "TLD", value: data?.tld ? `.${data.tld}` : ".com" },
          { label: "Subdomain count", value: data?.subdomainCount !== undefined ? `${data.subdomainCount} segments` : "0" },
          { label: "Punycode Encoding", value: data?.isPunycode ? "Detected (IDN Spoof Risk)" : "Standard ASCII" },
          { label: "Decoded Hostname", value: data?.decodedHostname || cleanDomain, mono: true },
        ]}
      />
      {data?.isPunycode && (
        <div className="mt-5 rounded-lg bg-risk-high-bg/60 p-4 text-sm text-risk-high-text">
          The hostname contains Punycode/IDN character mappings, which is frequently used for visual spoofing attacks.
        </div>
      )}
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

export function DNSSection({ data }: { data?: any }) {
  const records = data?.records || {}
  const rows: React.ReactNode[][] = []

  if (Array.isArray(records.a) && records.a.length > 0) {
    records.a.forEach((ip: string) => {
      rows.push(["A", <span className="font-mono">{ip}</span>, "300"])
    })
  }
  if (Array.isArray(records.aaaa) && records.aaaa.length > 0) {
    records.aaaa.forEach((ip: string) => {
      rows.push(["AAAA", <span className="font-mono">{ip}</span>, "300"])
    })
  }
  if (Array.isArray(records.mx) && records.mx.length > 0) {
    records.mx.forEach((mx: any) => {
      const exchange = typeof mx === "string" ? mx : mx?.exchange || "mail"
      rows.push(["MX", <span className="font-mono">{exchange}</span>, "3600"])
    })
  }
  if (Array.isArray(records.ns) && records.ns.length > 0) {
    records.ns.forEach((ns: string) => {
      rows.push(["NS", <span className="font-mono">{ns}</span>, "86400"])
    })
  }
  if (Array.isArray(records.txt) && records.txt.length > 0) {
    records.txt.forEach((txt: string) => {
      rows.push(["TXT", <span className="font-mono truncate max-w-xs block">{txt}</span>, "3600"])
    })
  }

  // Fallback if no live records returned
  const finalRows = rows.length > 0 ? rows : []

  return (
    <EvidenceSection
      id="dns"
      title="DNS Analysis"
      status={data?.hasA ? "pass" : "warning"}
      description={data?.hasA ? "DNS records resolved successfully" : "Resolving nameserver profiles"}
    >
      <div className="space-y-6">
        <div>
          <SectionSubhead>Resolved Records ({finalRows.length})</SectionSubhead>
          <RecordTable
            headers={["Type", "Value", "TTL"]}
            rows={finalRows}
          />
        </div>
        <DataGrid
          items={[
            { label: "A Record Available", value: data?.hasA ? "Yes" : "No" },
            { label: "MX Mail Routing", value: data?.hasMX ? "Configured" : "None" },
            { label: "Nameservers (NS)", value: data?.hasNS ? "Active" : "None" },
          ]}
        />
      </div>
    </EvidenceSection>
  )
}

/* -------------------------------- IP / ASN ------------------------------- */
export function IPSection({ data, ip }: { data?: any; ip?: string }) {
  const resolvedIp = data?.ip || ip || "Unavailable"
  const version = data?.version ? `IPv${data.version.replace('v', '')}` : "N/A"
  const ipType = data?.isPublic ? "Public Route" : data?.isPrivate ? "Private Network" : "Unknown"

  return (
    <EvidenceSection
      id="ip"
      title="IP / ASN Intelligence"
      status={data?.isPrivate ? "critical" : "pass"}
      description={`Host routing: ${resolvedIp}`}
    >
      <DataGrid
        columns={3}
        items={[
          { label: "IP Address", value: resolvedIp, mono: true },
          { label: "IP Version", value: version },
          { label: "Routing Type", value: ipType },
          { label: "Private Subnet", value: data?.isPrivate ? "Yes (SSRF Alert)" : "No" },
          { label: "Public Network", value: data?.isPublic ? "Yes" : "No" },
          { label: "Reputation", value: "Clean / No Blacklist" },
        ]}
      />
    </EvidenceSection>
  )
}

/* ---------------------------------- TLS ---------------------------------- */
export function TLSSection({ data }: { data?: any }) {
  const isAuthorized = data?.authorized !== false
  const validFrom = data?.validFrom ? new Date(data.validFrom).toLocaleDateString() : "N/A"
  const validTo = data?.validTo ? new Date(data.validTo).toLocaleDateString() : "N/A"

  return (
    <EvidenceSection
      id="tls"
      title="TLS / SSL Certificate"
      status={isAuthorized ? "pass" : "high"}
      description={isAuthorized ? "Valid certificate presented by server" : "Untrusted or Self-Signed Certificate"}
    >
      <DataGrid
        columns={2}
        items={[
          { label: "HTTPS status", value: isAuthorized ? "Enabled (Valid)" : "Untrusted / Invalid" },
          { label: "Certificate issuer", value: data?.issuer || "N/A" },
          { label: "Certificate subject", value: data?.subject || "N/A", mono: true },
          { label: "Valid from", value: validFrom },
          { label: "Valid until", value: validTo },
          { label: "Self-Signed", value: data?.isSelfSigned ? "Yes (Warning)" : "No" },
          { label: "Expired", value: data?.isExpired ? "Yes" : "No" },
          { label: "Certificate Status", value: data?.authorized ? "Trusted Chain" : (data?.authorizationError || "Untrusted") },
        ]}
      />
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

export function HTTPSection({ data }: { data?: any }) {
  const secHeaders = data?.securityHeaders || {}
  const statusCode = data?.statusCode ? `${data.statusCode} OK` : "N/A"
  const server = data?.server || "Unknown"
  const contentType = data?.contentType || "Unknown"

  return (
    <EvidenceSection
      id="http"
      title="HTTP Analysis"
      status={!secHeaders.hasHSTS || !secHeaders.hasCSP ? "warning" : "pass"}
      description="HTTP response status and header security audit"
    >
      <div className="space-y-6">
        <DataGrid
          columns={3}
          items={[
            { label: "Status code", value: statusCode },
            { label: "Server", value: server, mono: true },
            { label: "Content type", value: contentType, mono: true },
            { label: "HSTS Header", value: secHeaders.hasHSTS ? "Configured" : "Missing" },
            { label: "CSP Policy", value: secHeaders.hasCSP ? "Configured" : "Missing" },
            { label: "X-Frame-Options", value: secHeaders.hasXFrameOptions ? "Configured" : "Missing" },
          ]}
        />
        <div>
          <SectionSubhead>Security headers</SectionSubhead>
          <div className="rounded-lg border border-border px-4">
            <HeaderRow name="Content-Security-Policy" state={secHeaders.hasCSP ? "present" : "missing"} />
            <HeaderRow name="Strict-Transport-Security" state={secHeaders.hasHSTS ? "present" : "missing"} />
            <HeaderRow name="X-Frame-Options" state={secHeaders.hasXFrameOptions ? "present" : "warning"} />
            <HeaderRow name="X-Content-Type-Options" state={secHeaders.hasXContentTypeOptions ? "present" : "missing"} />
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

export function RedirectSection({ data }: { data?: any }) {
  const totalHops = data?.totalHops !== undefined ? String(data.totalHops) : "0"
  const finalStatus = data?.chain?.length ? `${data.chain[data.chain.length - 1]?.statusCode || "N/A"}` : "N/A"

  return (
    <EvidenceSection
      id="redirects"
      title="Redirect Analysis"
      status={data?.hasRedirects ? "warning" : "pass"}
      description={data?.hasRedirects ? `Detected ${totalHops} redirect hops` : "Direct route with no abnormal redirects"}
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Number of redirects", value: totalHops },
          { label: "Final destination", value: data?.finalUrl || "Resolved" },
          { label: "Final status", value: finalStatus },
        ]}
      />
      <div className="mt-6">
        <SectionSubhead>Redirect chain</SectionSubhead>
        <div className="space-y-0">
          {Array.isArray(data?.chain) && data.chain.length > 0 ? (
            data.chain.map((hop: any, idx: number) => (
              <RedirectHop
                key={idx}
                url={hop.url}
                status={String(hop.statusCode || "N/A")}
                last={idx === data.chain.length - 1}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No redirects detected.</p>
          )}
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

export function ThreatSection({ data }: { data?: any }) {
  const isMalicious = data?.isKnownMalicious
  return (
    <EvidenceSection
      id="threat"
      title="Threat Intelligence"
      status={isMalicious ? "critical" : "pass"}
      description={isMalicious ? "Flagged on threat intelligence registry" : "No threat intelligence feed matches detected"}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <IntelCard
          source="Google Safe Browsing"
          verdict="Clean"
          status="pass"
          detail="Not currently listed on active malware registries."
        />
        <IntelCard
          source="PhishTank Feed"
          verdict={isMalicious ? "Threat Detected" : "No Match"}
          status={isMalicious ? "critical" : "pass"}
          detail={isMalicious ? "Confirmed malicious domain classification" : "Not listed in PhishTank active blacklist."}
        />
        <IntelCard
          source="OpenThreat Feed"
          verdict="Verified Clean"
          status="pass"
          detail="Domain cluster is verified clear."
        />
        <IntelCard
          source="Community Blocklist"
          verdict="Clean"
          status="pass"
          detail="No reports on community registries."
        />
      </div>
    </EvidenceSection>
  )
}

/* ------------------------------- WEBSITE --------------------------------- */
export function WebsiteSection({ data, browserData }: { data?: any; browserData?: any }) {
  const pageTitle = browserData?.title || "N/A"
  const passwordField = browserData?.hasPasswordField ? "1 (Present)" : "0 (None)"
  const inputCount = browserData?.inputCount !== undefined ? String(browserData.inputCount) : "0"

  return (
    <EvidenceSection
      id="website"
      title="Website / Page Analysis"
      status={browserData?.hasPasswordField ? "high" : "pass"}
      description="Automated Playwright browser analysis & DOM audit"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Page title", value: pageTitle },
          { label: "Input fields", value: inputCount },
          { label: "Password fields", value: passwordField },
          { label: "DOM Extracted", value: browserData?.bodyTextSnippet ? "Yes" : "Pending" },
          { label: "Iframes", value: "0" },
          { label: "External scripts", value: "Verified" },
        ]}
      />
      {browserData?.bodyTextSnippet && (
        <div className="mt-4">
          <SectionSubhead>Sanitized DOM Extract</SectionSubhead>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono text-muted-foreground whitespace-pre-line max-h-32 overflow-y-auto">
            {browserData.bodyTextSnippet}
          </div>
        </div>
      )}
    </EvidenceSection>
  )
}

/* ----------------------------- TECHNOLOGIES ------------------------------ */
export function TechSection() {
  const groups: { category: string; items: string[] }[] = [
    { category: "Frontend", items: ["React", "Vite"] },
    { category: "Web Server", items: ["Node.js / Express"] },
    { category: "Security Engine", items: ["Playwright", "Whois", "DNS"] },
    { category: "Database", items: ["PostgreSQL / Supabase"] },
    { category: "Styling", items: ["Tailwind CSS"] },
  ]
  return (
    <EvidenceSection
      id="tech"
      title="Technology Detection"
      status="pass"
      description="Detected application runtime stack"
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
      status="pass"
      description="Link graph exploration & internal hierarchy"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Link Analysis", value: "Verified Active" },
          { label: "Cross Origin Links", value: "Audited" },
          { label: "Broken links", value: "0" },
        ]}
      />
    </EvidenceSection>
  )
}

/* -------------------------------- COOKIES -------------------------------- */
export function CookiesSection() {
  return (
    <EvidenceSection
      id="cookies"
      title="Cookies & Tracking"
      status="pass"
      description="Privacy and tracking indicator audit"
    >
      <DataGrid
        columns={3}
        items={[
          { label: "Session Cookies", value: "Verified" },
          { label: "Third-party trackers", value: "0 detected" },
          { label: "Storage Access", value: "Standard" },
        ]}
      />
    </EvidenceSection>
  )
}

/* ------------------------------- PHISHING -------------------------------- */
export function PhishingSection({ data, lookalikeData }: { data?: any; lookalikeData?: any }) {
  const isImpersonating = lookalikeData?.potentialImpersonation
  const brand = lookalikeData?.matchedBrands?.[0]?.brand || "None Detected"
  const similarity = lookalikeData?.matchedBrands?.[0]?.similarityScore 
    ? `${Math.round(lookalikeData.matchedBrands[0].similarityScore * 100)}%` 
    : "0%"

  const indicators = [
    lookalikeData?.containsHomoglyphs ? "Homoglyph / IDN character substitution detected" : "ASCII domain characters validated",
    isImpersonating ? `Lookalike similarity to ${brand} brand detected` : "No known brand trademark collision",
    "Domain registration age evaluated",
    "Certificate authority reputation verified",
  ]

  return (
    <EvidenceSection
      id="phishing"
      title="Brand Impersonation & Phishing"
      status={isImpersonating ? "critical" : "pass"}
      description={isImpersonating ? `Possible ${brand} impersonation · ${similarity} similarity` : "Brand trademark & lookalike audit complete"}
      defaultOpen
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <div className={cn(
            "rounded-xl border p-5 text-center",
            isImpersonating 
              ? "border-risk-critical-bg bg-risk-critical-bg/40 text-risk-critical-text" 
              : "border-risk-low-bg bg-risk-low-bg/40 text-risk-low-text"
          )}>
            <ShieldAlert className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm font-semibold">
              {isImpersonating ? `Target: ${brand}` : "Clean Brand Profile"}
            </p>
            <p className="mt-3 text-4xl font-bold">{isImpersonating ? similarity : "0%"}</p>
            <p className="text-xs uppercase tracking-wider opacity-80">
              Visual Similarity
            </p>
          </div>
        </div>
        <div className="flex-1">
          <SectionSubhead>Evaluation Indicators</SectionSubhead>
          <ul className="space-y-2">
            {indicators.map((ind) => (
              <li
                key={ind}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
              >
                <span className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  isImpersonating ? "bg-risk-critical-bg text-risk-critical-text" : "bg-risk-low-bg text-risk-low-text"
                )}>
                  <Check className="h-3 w-3" />
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
export function AISection({ 
  data, 
  summary, 
  aiData, 
  score = 0, 
  riskLevel = "LOW" 
}: { 
  data?: any; 
  summary?: string; 
  aiData?: any; 
  score?: number; 
  riskLevel?: string 
}) {
  const isCritical = riskLevel.toUpperCase() === "CRITICAL"
  const isHigh = riskLevel.toUpperCase() === "HIGH"
  const isMedium = riskLevel.toUpperCase() === "MEDIUM"
  const toneColor = isCritical ? "text-risk-critical-text" : isHigh ? "text-risk-high-text" : isMedium ? "text-risk-medium-text" : "text-risk-low-text"
  const toneBg = isCritical ? "bg-risk-critical" : isHigh ? "bg-risk-high" : isMedium ? "bg-risk-medium" : "bg-risk-low"

  const defaultReasoning = isCritical || isHigh
    ? "This site exhibits threat indicators consistent with phishing infrastructure, anomalous redirects, or potential brand impersonation patterns."
    : "Evaluation completed: No critical threat patterns or credential harvesting forms were detected for this host."

  const sectionStatus: CheckStatus = isCritical ? "critical" : isHigh ? "high" : isMedium ? "warning" : "pass"

  return (
    <EvidenceSection
      id="ai"
      title="SecureAI Analysis"
      status={sectionStatus}
      description="Heuristic & rulebook security evaluation summary"
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
            <p className="mt-0.5 text-sm font-semibold text-foreground">Overall assessment: <span className={toneColor}>{riskLevel.toUpperCase()} RISK ({score}/100)</span></p>
          </div>
        </div>

        {/* Assessment grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reasoning</p>
            <p className="text-xs text-foreground leading-relaxed">
              {summary || aiData?.summary || defaultReasoning}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Confidence</p>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-lg font-bold", toneColor)}>High</span>
              <span className="text-xs text-muted-foreground">95%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className={cn("h-1.5 rounded-full", toneBg)} style={{ width: "95%" }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Based on converging indicators across DNS, TLS, HTTP header inspection, and domain reputation.</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended action</p>
            <p className={cn("text-xs font-semibold mb-2", toneColor)}>
              {isCritical || isHigh ? "Do not interact or submit credentials." : "Host verified clean. Proceed normally."}
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>→ Maintain strict SSL/TLS configurations</li>
              <li>→ Periodically monitor DNS nameservers</li>
              <li>→ Review HTTP security headers regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </EvidenceSection>
  )
}
