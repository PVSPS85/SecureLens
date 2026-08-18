// Mock/demo investigation data for SecureLens.
// NOTE: This is illustrative UI data only. No real security checks are performed.

export type CheckStatus =
  | "pass"
  | "warning"
  | "suspicious"
  | "high"
  | "critical"
  | "unavailable"

export interface SectionMeta {
  id: string
  label: string
  navLabel: string
  status: CheckStatus
}

// Sections drive both the sticky nav and the check explorer ordering.
export const sections: SectionMeta[] = [
  { id: "overview", label: "Overview", navLabel: "Overview", status: "critical" },
  { id: "summary", label: "Investigation Summary", navLabel: "Summary", status: "critical" },
  { id: "preview", label: "Website Preview", navLabel: "Preview", status: "critical" },
  { id: "target", label: "Target Information", navLabel: "Target", status: "warning" },
  { id: "url", label: "URL Analysis", navLabel: "URL", status: "suspicious" },
  { id: "dns", label: "DNS Analysis", navLabel: "DNS", status: "warning" },
  { id: "ip", label: "IP / ASN Intelligence", navLabel: "IP / ASN", status: "suspicious" },
  { id: "tls", label: "TLS / SSL Certificate", navLabel: "TLS", status: "pass" },
  { id: "http", label: "HTTP Analysis", navLabel: "HTTP", status: "high" },
  { id: "redirects", label: "Redirect Analysis", navLabel: "Redirects", status: "suspicious" },
  { id: "threat", label: "Threat Intelligence", navLabel: "Threat Intel", status: "critical" },
  { id: "website", label: "Website / Page Analysis", navLabel: "Website", status: "high" },
  { id: "tech", label: "Technology Detection", navLabel: "Technologies", status: "pass" },
  { id: "links", label: "Link Analysis", navLabel: "Links", status: "warning" },
  { id: "cookies", label: "Cookies & Tracking", navLabel: "Cookies", status: "warning" },
  { id: "phishing", label: "Brand Impersonation & Phishing", navLabel: "Phishing", status: "critical" },
  { id: "ai", label: "SecureAI Analysis", navLabel: "AI Analysis", status: "critical" },
]

export const statusLabel: Record<CheckStatus, string> = {
  pass: "PASS",
  warning: "WARNING",
  suspicious: "SUSPICIOUS",
  high: "HIGH",
  critical: "CRITICAL",
  unavailable: "NOT AVAILABLE",
}

export const timeline = [
  { time: "12:42:03", label: "Investigation started", target: "overview", tone: "info" },
  { time: "12:42:04", label: "URL analysis completed", target: "url", tone: "ok" },
  { time: "12:42:04", label: "DNS analysis completed", target: "dns", tone: "ok" },
  { time: "12:42:05", label: "IP intelligence completed", target: "ip", tone: "ok" },
  { time: "12:42:05", label: "TLS analysis completed", target: "tls", tone: "ok" },
  { time: "12:42:06", label: "HTTP analysis completed", target: "http", tone: "warn" },
  { time: "12:42:07", label: "Redirect analysis completed", target: "redirects", tone: "warn" },
  { time: "12:42:08", label: "Threat intelligence warning", target: "threat", tone: "warn" },
  { time: "12:42:09", label: "Brand impersonation detected", target: "phishing", tone: "bad" },
  { time: "12:42:10", label: "Risk score calculated", target: "overview", tone: "ok" },
  { time: "12:42:11", label: "SecureAI analysis completed", target: "ai", tone: "ok" },
] as const
