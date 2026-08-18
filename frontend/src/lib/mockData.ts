export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface SearchResult {
  name: string
  domain: string
  description: string
}

// TODO(backend): Replace these hardcoded KPIs with API calls
export const DASHBOARD_KPIS = [
  { label: "Total Scans", value: "1,248", type: "total" },
  { label: "Low Risk", value: "892", type: "low" },
  { label: "Medium Risk", value: "214", type: "medium" },
  { label: "High / Critical", value: "142", type: "critical" },
]

// TODO(backend): Implement live backend search for brands and domains
export const BRAND_DB: Record<string, SearchResult[]> = {
  apple: [
    { name: "Apple", domain: "apple.com", description: "Official website" },
    { name: "Apple Support", domain: "support.apple.com", description: "Official Apple support" },
    { name: "Apple Developer", domain: "developer.apple.com", description: "Developer website" },
  ],
  google: [
    { name: "Google", domain: "google.com", description: "Official website" },
    { name: "Google Maps", domain: "maps.google.com", description: "Mapping service" },
    { name: "Google Drive", domain: "drive.google.com", description: "Cloud storage" },
  ],
  paypal: [
    { name: "PayPal", domain: "paypal.com", description: "Official payment platform" },
    { name: "PayPal Business", domain: "business.paypal.com", description: "Business tools" },
  ],
  amazon: [
    { name: "Amazon", domain: "amazon.com", description: "E-commerce platform" },
    { name: "Amazon Web Services", domain: "aws.amazon.com", description: "Cloud services" },
    { name: "Amazon Prime Video", domain: "primevideo.amazon.com", description: "Video streaming" },
  ],
  microsoft: [
    { name: "Microsoft", domain: "microsoft.com", description: "Official website" },
    { name: "Microsoft 365", domain: "microsoft365.com", description: "Productivity suite" },
    { name: "Microsoft Azure", domain: "azure.microsoft.com", description: "Cloud platform" },
  ],
  netflix: [
    { name: "Netflix", domain: "netflix.com", description: "Streaming platform" },
    { name: "Netflix Help Center", domain: "help.netflix.com", description: "Support" },
  ],
  facebook: [
    { name: "Facebook", domain: "facebook.com", description: "Social network" },
    { name: "Meta Business Suite", domain: "business.facebook.com", description: "Business tools" },
  ],
  instagram: [
    { name: "Instagram", domain: "instagram.com", description: "Photo & video sharing" },
    { name: "Instagram Help", domain: "help.instagram.com", description: "Support center" },
  ],
  twitter: [
    { name: "X (Twitter)", domain: "x.com", description: "Social platform" },
    { name: "X Developer", domain: "developer.x.com", description: "Developer platform" },
  ],
  github: [
    { name: "GitHub", domain: "github.com", description: "Code hosting platform" },
    { name: "GitHub Docs", domain: "docs.github.com", description: "Documentation" },
    { name: "GitHub Status", domain: "githubstatus.com", description: "Platform status" },
  ],
  chase: [
    { name: "Chase Bank", domain: "chase.com", description: "Official banking" },
    { name: "Chase Business", domain: "business.chase.com", description: "Business banking" },
  ],
  coinbase: [
    { name: "Coinbase", domain: "coinbase.com", description: "Crypto exchange" },
    { name: "Coinbase Pro", domain: "pro.coinbase.com", description: "Advanced trading" },
  ],
}

// TODO(backend): Replace this with the user's actual scan history API endpoint
export const RECENT_SCANS = [
  { target: "suspicious-login-update.net", risk: "critical" as RiskLevel, score: 98, time: "2 mins ago" },
  { target: "crypto-wallet-verify.io", risk: "high" as RiskLevel, score: 75, time: "1 hour ago" },
  { target: "shop-deals-today.com", risk: "medium" as RiskLevel, score: 45, time: "3 hours ago" },
  { target: "example-secure.com", risk: "low" as RiskLevel, score: 12, time: "5 hours ago" },
  { target: "fake-paypal-login.net", risk: "critical" as RiskLevel, score: 96, time: "Yesterday" },
  { target: "secure-account-check.com", risk: "high" as RiskLevel, score: 81, time: "Yesterday" },
  { target: "github-login-verify.net", risk: "critical" as RiskLevel, score: 93, time: "2 days ago" },
]

// TODO(backend): Replace this with the global lookalike alerts API endpoint
export const LOOKALIKE_DISCOVERY = [
  { domain: "paypal-update-sec.com", risk: "critical" as RiskLevel, age: "3 days" },
  { domain: "apple-id-verify24.net", risk: "critical" as RiskLevel, age: "1 day" },
  { domain: "microsoft-login-secure.org", risk: "high" as RiskLevel, age: "5 days" },
  { domain: "chase-bank-alert.com", risk: "critical" as RiskLevel, age: "2 days" },
  { domain: "crypto-wallet-secure.io", risk: "high" as RiskLevel, age: "2 days" },
]

// TODO(backend): Provide full scan report details via API by scan ID
export const DEMO_INVESTIGATION_TARGET = {
  domain: "suspicious-login-update.net",
  riskScore: 98,
  riskLevel: "critical",
  scanId: "SL-INV-000142",
}

export type DetectionType = "brand-impersonation" | "lookalike-domain" | "typosquatting" | "keyword-impersonation"

export interface LookalikePair {
  id: string
  brand: string
  legitimateDomain: string
  lookalikeDomain: string
  similarity: number
  risk: RiskLevel
  detection: DetectionType
  detected: string
  detectedDate: string
}

// TODO(backend): Implement API to return detected lookalike domains
export const LOOKALIKE_PAIRS: LookalikePair[] = [
  { id: "1",  brand: "Apple",           legitimateDomain: "apple.com",          lookalikeDomain: "apple-login-secure.net",         similarity: 94, risk: "critical", detection: "brand-impersonation", detected: "2h ago",     detectedDate: "2026-08-11" },
  { id: "2",  brand: "Chase",           legitimateDomain: "chase.com",          lookalikeDomain: "chase-bank-alert.com",            similarity: 97, risk: "critical", detection: "brand-impersonation", detected: "Today",      detectedDate: "2026-08-11" },
  { id: "3",  brand: "Bank of America", legitimateDomain: "bankofamerica.com",  lookalikeDomain: "bankofamerica-secure-check.net",  similarity: 94, risk: "critical", detection: "brand-impersonation", detected: "3h ago",     detectedDate: "2026-08-11" },
  { id: "4",  brand: "Coinbase",        legitimateDomain: "coinbase.com",       lookalikeDomain: "coinbase-wallet-verify.io",       similarity: 96, risk: "critical", detection: "brand-impersonation", detected: "4h ago",     detectedDate: "2026-08-11" },
  { id: "5",  brand: "Apple",           legitimateDomain: "apple.com",          lookalikeDomain: "apple-id-verify24.net",           similarity: 91, risk: "critical", detection: "brand-impersonation", detected: "5h ago",     detectedDate: "2026-08-11" },
  { id: "6",  brand: "Instagram",       legitimateDomain: "instagram.com",      lookalikeDomain: "instagram-verify-id.com",         similarity: 93, risk: "critical", detection: "brand-impersonation", detected: "8h ago",     detectedDate: "2026-08-11" },
  { id: "7",  brand: "Wells Fargo",     legitimateDomain: "wellsfargo.com",     lookalikeDomain: "wellsfargo-secure-portal.net",    similarity: 95, risk: "critical", detection: "brand-impersonation", detected: "Today",      detectedDate: "2026-08-11" },
  { id: "8",  brand: "GitHub",          legitimateDomain: "github.com",         lookalikeDomain: "github-login-check.net",          similarity: 92, risk: "critical", detection: "brand-impersonation", detected: "8h ago",     detectedDate: "2026-08-11" },
  { id: "9",  brand: "PayPal",          legitimateDomain: "paypal.com",         lookalikeDomain: "paypal-account-verify.net",       similarity: 89, risk: "high",     detection: "lookalike-domain",    detected: "5h ago",     detectedDate: "2026-08-11" },
  { id: "10", brand: "PayPal",          legitimateDomain: "paypal.com",         lookalikeDomain: "paypal-update-sec.com",           similarity: 88, risk: "high",     detection: "lookalike-domain",    detected: "Yesterday",  detectedDate: "2026-08-10" },
  { id: "11", brand: "Netflix",         legitimateDomain: "netflix.com",        lookalikeDomain: "netflix-subscription-renew.net",  similarity: 91, risk: "critical", detection: "brand-impersonation", detected: "2 days ago", detectedDate: "2026-08-09" },
  { id: "12", brand: "Microsoft",       legitimateDomain: "microsoft.com",      lookalikeDomain: "microsoft-login-secure.org",      similarity: 87, risk: "high",     detection: "lookalike-domain",    detected: "Yesterday",  detectedDate: "2026-08-10" },
  { id: "13", brand: "Google",          legitimateDomain: "google.com",         lookalikeDomain: "googledrive-shared-file.com",     similarity: 79, risk: "high",     detection: "lookalike-domain",    detected: "Yesterday",  detectedDate: "2026-08-10" },
  { id: "14", brand: "Amazon",          legitimateDomain: "amazon.com",         lookalikeDomain: "amazon-order-update.info",        similarity: 85, risk: "high",     detection: "lookalike-domain",    detected: "3 days ago", detectedDate: "2026-08-08" },
  { id: "15", brand: "IRS",             legitimateDomain: "irs.gov",            lookalikeDomain: "irs-refund-claim.net",            similarity: 76, risk: "high",     detection: "keyword-impersonation", detected: "2 days ago", detectedDate: "2026-08-09" },
  { id: "16", brand: "Dropbox",         legitimateDomain: "dropbox.com",        lookalikeDomain: "dropbox-shared-doc.net",          similarity: 72, risk: "medium",   detection: "lookalike-domain",    detected: "4 days ago", detectedDate: "2026-08-07" },
  { id: "17", brand: "LinkedIn",        legitimateDomain: "linkedin.com",       lookalikeDomain: "linkedin-jobs-apply.info",        similarity: 68, risk: "medium",   detection: "lookalike-domain",    detected: "5 days ago", detectedDate: "2026-08-06" },
]

export type InvType = "URL" | "Domain" | "IP Address" | "Email" | "QR Code"

export interface Investigation {
  id: string
  target: string
  type: InvType
  risk: RiskLevel
  score: number
  firstAnalyzed: string
  firstAnalyzedDate: string
  lastUpdated: string
  status: "completed" | "processing" | "failed"
  findings: { critical: number; high: number; medium: number; low: number }
}

// TODO(backend): Provide scan history API for the authenticated user
export const RECENT_INVESTIGATIONS_HISTORY: Investigation[] = [
  { id: "1",  target: "suspicious-login-update.net", type: "URL",        risk: "critical", score: 98, firstAnalyzed: "Aug 11, 10:42 AM", firstAnalyzedDate: "2026-08-11", lastUpdated: "2 mins ago",    status: "completed",  findings: { critical: 4, high: 3, medium: 2, low: 1 } },
  { id: "2",  target: "crypto-wallet-verify.io",     type: "Domain",     risk: "high",     score: 75, firstAnalyzed: "Aug 11, 08:15 AM", firstAnalyzedDate: "2026-08-11", lastUpdated: "1 hour ago",    status: "completed",  findings: { critical: 2, high: 3, medium: 2, low: 2 } },
  { id: "3",  target: "shop-deals-today.com",         type: "URL",        risk: "medium",   score: 45, firstAnalyzed: "Aug 11, 06:30 AM", firstAnalyzedDate: "2026-08-11", lastUpdated: "3 hours ago",   status: "completed",  findings: { critical: 0, high: 1, medium: 3, low: 2 } },
  { id: "4",  target: "198.51.100.42",               type: "IP Address", risk: "high",     score: 71, firstAnalyzed: "Aug 11, 05:00 AM", firstAnalyzedDate: "2026-08-11", lastUpdated: "5 hours ago",   status: "completed",  findings: { critical: 1, high: 3, medium: 1, low: 0 } },
  { id: "5",  target: "verify-now@phish-mail.net",   type: "Email",      risk: "critical", score: 91, firstAnalyzed: "Aug 10, 3:22 PM",  firstAnalyzedDate: "2026-08-10", lastUpdated: "Yesterday",     status: "completed",  findings: { critical: 3, high: 2, medium: 1, low: 0 } },
  { id: "6",  target: "fake-paypal-login.net",        type: "URL",        risk: "critical", score: 96, firstAnalyzed: "Aug 10, 11:08 AM", firstAnalyzedDate: "2026-08-10", lastUpdated: "Yesterday",     status: "completed",  findings: { critical: 5, high: 2, medium: 1, low: 0 } },
  { id: "7",  target: "secure-account-check.com",    type: "Domain",     risk: "high",     score: 81, firstAnalyzed: "Aug 10, 09:30 AM", firstAnalyzedDate: "2026-08-10", lastUpdated: "Yesterday",     status: "completed",  findings: { critical: 1, high: 4, medium: 2, low: 1 } },
  { id: "8",  target: "example-secure.com",           type: "Domain",     risk: "low",      score: 12, firstAnalyzed: "Aug 10, 07:15 AM", firstAnalyzedDate: "2026-08-10", lastUpdated: "2 days ago",    status: "completed",  findings: { critical: 0, high: 0, medium: 1, low: 2 } },
  { id: "9",  target: "github-login-verify.net",      type: "URL",        risk: "critical", score: 93, firstAnalyzed: "Aug 9, 2:45 PM",   firstAnalyzedDate: "2026-08-09", lastUpdated: "2 days ago",    status: "completed",  findings: { critical: 3, high: 3, medium: 2, low: 0 } },
  { id: "10", target: "unknown-domain.xyz",           type: "Domain",     risk: "medium",   score: 52, firstAnalyzed: "Aug 9, 11:20 AM",  firstAnalyzedDate: "2026-08-09", lastUpdated: "Processing…",   status: "processing", findings: { critical: 0, high: 2, medium: 3, low: 2 } },
  { id: "11", target: "apple-support-verify.co",      type: "URL",        risk: "high",     score: 78, firstAnalyzed: "Aug 8, 4:10 PM",   firstAnalyzedDate: "2026-08-08", lastUpdated: "3 days ago",    status: "completed",  findings: { critical: 2, high: 3, medium: 1, low: 1 } },
  { id: "12", target: "secure-banking-update.org",   type: "URL",        risk: "critical", score: 99, firstAnalyzed: "Aug 8, 1:55 PM",   firstAnalyzedDate: "2026-08-08", lastUpdated: "3 days ago",    status: "completed",  findings: { critical: 6, high: 2, medium: 1, low: 0 } },
  { id: "13", target: "netflix-billing-info.net",    type: "Domain",     risk: "high",     score: 72, firstAnalyzed: "Aug 7, 11:00 AM",  firstAnalyzedDate: "2026-08-07", lastUpdated: "4 days ago",    status: "completed",  findings: { critical: 1, high: 3, medium: 3, low: 1 } },
  { id: "14", target: "spoof@amazon-alert.com",      type: "Email",      risk: "high",     score: 84, firstAnalyzed: "Aug 7, 09:30 AM",  firstAnalyzedDate: "2026-08-07", lastUpdated: "4 days ago",    status: "completed",  findings: { critical: 2, high: 3, medium: 1, low: 0 } },
  { id: "15", target: "cloudflare.com",               type: "Domain",     risk: "low",      score: 8,  firstAnalyzed: "Aug 6, 3:00 PM",   firstAnalyzedDate: "2026-08-06", lastUpdated: "5 days ago",    status: "completed",  findings: { critical: 0, high: 0, medium: 0, low: 1 } },
  { id: "16", target: "185.199.108.153",              type: "IP Address", risk: "critical", score: 92, firstAnalyzed: "Aug 6, 10:00 AM",  firstAnalyzedDate: "2026-08-06", lastUpdated: "5 days ago",    status: "failed",     findings: { critical: 0, high: 0, medium: 0, low: 0 } },
]

export type ReportStatus = "ready" | "generating" | "failed"

export interface Report {
  id: string
  target: string
  risk: RiskLevel
  score: number
  type: string
  created: string
  createdDate: string
  lastUpdated: string
  status: ReportStatus
}

// TODO(backend): Provide reports API
export const MOCK_REPORTS: Report[] = [
  { id: "1",  target: "suspicious-login-update.net", risk: "critical", score: 98, type: "Full Investigation", created: "Today, 10:42 AM",     createdDate: "2026-08-11", lastUpdated: "Today, 10:42 AM",     status: "ready"      },
  { id: "2",  target: "crypto-wallet-verify.io",     risk: "high",     score: 75, type: "Domain Analysis",   created: "Today, 08:15 AM",     createdDate: "2026-08-11", lastUpdated: "Today, 08:15 AM",     status: "ready"      },
  { id: "3",  target: "verify-now@phish-mail.net",   risk: "critical", score: 91, type: "Email Analysis",    created: "Today, 06:30 AM",     createdDate: "2026-08-11", lastUpdated: "Today, 06:30 AM",     status: "ready"      },
  { id: "4",  target: "fake-paypal-login.net",       risk: "critical", score: 96, type: "Full Investigation", created: "Yesterday, 3:22 PM",  createdDate: "2026-08-10", lastUpdated: "Today, 09:00 AM",     status: "ready"      },
  { id: "5",  target: "shop-deals-today.com",        risk: "medium",   score: 45, type: "URL Scan",          created: "Yesterday, 11:08 AM", createdDate: "2026-08-10", lastUpdated: "Yesterday, 11:08 AM", status: "ready"      },
  { id: "6",  target: "secure-account-check.com",   risk: "high",     score: 81, type: "Email Analysis",    created: "Aug 9, 2:45 PM",      createdDate: "2026-08-09", lastUpdated: "Aug 9, 2:45 PM",      status: "ready"      },
  { id: "7",  target: "github-login-verify.net",    risk: "critical", score: 93, type: "Full Investigation", created: "Aug 9, 9:30 AM",      createdDate: "2026-08-09", lastUpdated: "Aug 10, 1:00 PM",     status: "ready"      },
  { id: "8",  target: "198.51.100.42",              risk: "high",     score: 71, type: "IP Analysis",       created: "Aug 8, 5:00 PM",      createdDate: "2026-08-08", lastUpdated: "Aug 8, 5:00 PM",      status: "ready"      },
  { id: "9",  target: "example-secure.com",          risk: "low",      score: 12, type: "Domain Analysis",   created: "Aug 8, 4:10 PM",      createdDate: "2026-08-08", lastUpdated: "Aug 8, 4:10 PM",      status: "ready"      },
  { id: "10", target: "apple-support-verify.co",    risk: "high",     score: 78, type: "Full Investigation", created: "Aug 8, 1:55 PM",      createdDate: "2026-08-08", lastUpdated: "Aug 8, 1:55 PM",      status: "ready"      },
  { id: "11", target: "unknown-domain.xyz",          risk: "medium",   score: 52, type: "URL Scan",          created: "Aug 7, 11:20 AM",     createdDate: "2026-08-07", lastUpdated: "Aug 7, 11:20 AM",     status: "generating" },
  { id: "12", target: "secure-banking-update.org",  risk: "critical", score: 99, type: "Full Investigation", created: "Aug 6, 3:00 PM",      createdDate: "2026-08-06", lastUpdated: "Aug 6, 3:00 PM",      status: "ready"      },
  { id: "13", target: "spoof@amazon-alert.com",     risk: "high",     score: 84, type: "Email Analysis",    created: "Aug 5, 10:00 AM",     createdDate: "2026-08-05", lastUpdated: "Aug 5, 10:00 AM",     status: "ready"      },
  { id: "14", target: "netflix-billing-info.net",   risk: "high",     score: 72, type: "Full Investigation", created: "Aug 4, 2:30 PM",      createdDate: "2026-08-04", lastUpdated: "Aug 4, 2:30 PM",      status: "failed"     },
]

export interface ScanItem { label: string; risk: "low" | "medium" | "high" | "critical"; score: number; time: string }

export const QR_CHECKS    = ["Embedded URL extraction", "Malicious payload detection", "Redirect chain analysis", "Domain reputation check", "QR obfuscation detection"]
export const EMAIL_CHECKS = ["Header & sender analysis", "Link extraction & scanning", "Spoofing / impersonation detection", "SPF / DKIM / DMARC validation", "Phishing keyword scoring", "Attachment safety indicator"]
export const PHONE_CHECKS = ["Number format validation", "Country / region lookup", "Carrier & line-type lookup", "Spam reputation check", "Scam report intelligence", "Fraud report matching", "Spoofing risk assessment", "Number type detection"]

export const RECENT_QR: ScanItem[] = [
  { label: "Decoded → https://phishing-wallet.io/redeem",  risk: "critical", score: 95, time: "30 mins ago" },
  { label: "Decoded → https://deal-coupon.net/promo",      risk: "medium",   score: 49, time: "2 hours ago" },
  { label: "Decoded → https://github.com/securelens",      risk: "low",      score: 6,  time: "Yesterday"   },
]

export const RECENT_EMAIL: ScanItem[] = [
  { label: "noreply@paypa1-secure.com — Phishing detected",      risk: "critical", score: 97, time: "1 hour ago"  },
  { label: "offers@newsletter-deals.io — Suspicious links",      risk: "medium",   score: 53, time: "4 hours ago" },
  { label: "updates@verify-id-alert.net — Spoofing indicators",  risk: "high",     score: 80, time: "Yesterday"   },
  { label: "team@company.com — No threats found",                 risk: "low",      score: 8,  time: "2 days ago"  },
]

export const RECENT_PHONE: ScanItem[] = [
  { label: "+91 98765 43210 — Scam reports detected",           risk: "high",     score: 78, time: "1 hour ago"  },
  { label: "+1 (555) 867-5309 — Linked to known scam network",  risk: "high",     score: 80, time: "3 hours ago" },
  { label: "+44 7700 900123 — Reported spoofing activity",      risk: "medium",   score: 55, time: "Yesterday"   },
  { label: "+1 (800) 555-0100 — No threats found",              risk: "low",      score: 10, time: "2 days ago"  },
]

export const PHONE_SCAN_STEPS = [
  "Number received",
  "Number format validation",
  "Country / region lookup",
  "Carrier & line-type check",
  "Reputation database check",
  "Scam report analysis",
  "Spam activity check",
  "Spoofing risk assessment",
  "Risk score calculated",
]

export const EMAIL_SCAN_STEPS = [
  "Email received",
  "Parsing email headers",
  "Sender address analysis",
  "SPF record verification",
  "DKIM signature check",
  "DMARC policy check",
  "Link extraction",
  "Phishing content analysis",
  "Brand impersonation check",
  "Risk score calculated",
]

export const DEMO_EMAIL = `From: PayPal Security <noreply@paypa1-secure.com>
To: user@gmail.com
Subject: Urgent: Your account has been locked
Reply-To: support@paypa1-update.net

Dear customer,

Your PayPal account will be permanently closed unless you verify
your identity within 24 hours.

Please click the link below to verify your account immediately:

https://paypa1-secure.com/verify?token=abc123

This is an automated message. Do not reply to this email.

PayPal Security Team`

export const QR_DEMO_URL = "https://phishing-wallet.io/redeem"

export type EvidenceStatus = "PASS" | "WARNING" | "SUSPICIOUS" | "HIGH" | "CRITICAL"

export interface EvidenceRowData {
  check: string
  status: EvidenceStatus
  value: string
  explanation: string
}

export interface EvidenceSectionData {
  name: string
  rows: EvidenceRowData[]
}

// TODO(backend): Provide technical evidence data via API by scan ID
export const TECHNICAL_EVIDENCE: EvidenceSectionData[] = [
  {
    name: "URL Analysis",
    rows: [
      { check: "Lookalike keywords",  status: "SUSPICIOUS", value: "login, update, verify",             explanation: "Brand-adjacent keywords combined with non-brand TLD — common phishing pattern." },
      { check: "Scheme",              status: "WARNING",    value: "HTTP → HTTPS redirect",              explanation: "Submitted as HTTP, then upgraded. Legitimate services typically use HTTPS directly." },
      { check: "Query parameters",    status: "WARNING",    value: "?session=…&ref=email",               explanation: "Tracking parameters consistent with a phishing email campaign." },
    ],
  },
  {
    name: "DNS Analysis",
    rows: [
      { check: "A record",            status: "HIGH",       value: "185.199.108.153",                    explanation: "Resolves to a bulletproof-adjacent VPS in the Netherlands." },
      { check: "NS change",           status: "WARNING",    value: "Rotated 2 days ago",                 explanation: "Recent nameserver rotation is consistent with fast-flux phishing infrastructure." },
      { check: "TTL",                 status: "WARNING",    value: "300s (low)",                         explanation: "Low TTL combined with recent NS change — allows rapid IP switching." },
    ],
  },
  {
    name: "IP / ASN Intelligence",
    rows: [
      { check: "IP address",          status: "SUSPICIOUS", value: "185.199.108.153",                    explanation: "Hosted on Rapid Cloud Networks (RapidVPS), elevated abuse reports." },
      { check: "ASN",                 status: "SUSPICIOUS", value: "AS200000",                           explanation: "41 related suspicious domains on the same /24 subnet." },
      { check: "Country",             status: "WARNING",    value: "Netherlands (NL)",                   explanation: "Hosting jurisdiction inconsistent with the impersonated brand." },
    ],
  },
  {
    name: "TLS / SSL Certificate",
    rows: [
      { check: "Certificate issuer",  status: "PASS",       value: "Let's Encrypt R3",                  explanation: "Valid certificate, but free certificates are routinely issued to phishing domains." },
      { check: "TLS version",         status: "PASS",       value: "TLS 1.3",                           explanation: "Current version in use." },
      { check: "Domain match",        status: "PASS",       value: "CN=login-example.net",              explanation: "Certificate matches the effective domain. HTTPS does not imply legitimacy." },
    ],
  },
  {
    name: "HTTP Analysis",
    rows: [
      { check: "Content-Security-Policy", status: "CRITICAL",  value: "Missing",                       explanation: "Absence allows arbitrary script injection and cross-origin data exfiltration." },
      { check: "Strict-Transport-Security",status: "CRITICAL", value: "Missing",                       explanation: "No HSTS means the browser does not enforce HTTPS on future visits." },
      { check: "Referrer-Policy",     status: "HIGH",       value: "Missing",                           explanation: "Referrer data may be leaked to third-party tracking services." },
    ],
  },
  {
    name: "Redirect Analysis",
    rows: [
      { check: "Hop count",           status: "WARNING",    value: "3 redirects",                       explanation: "Multiple hops before reaching the final destination." },
      { check: "Cross-domain hop",    status: "SUSPICIOUS", value: "→ login-example.net",               explanation: "One hop crosses to a different domain — a common phishing obfuscation technique." },
      { check: "Final status",        status: "PASS",       value: "200 OK",                            explanation: "Page resolved successfully." },
    ],
  },
  {
    name: "Threat Intelligence",
    rows: [
      { check: "PhishTank",           status: "CRITICAL",   value: "Confirmed phishing (91% confidence)", explanation: "Reported 6 hours prior to analysis. Credential harvesting classification." },
      { check: "OpenThreat Feed",     status: "SUSPICIOUS", value: "Suspicious — 74% confidence",       explanation: "Clustered with known phishing kit infrastructure." },
      { check: "Community Blocklist", status: "HIGH",       value: "Listed on 3 blocklists",            explanation: "Listed by community reporters within the last 30 days." },
      { check: "Google Safe Browsing",status: "PASS",       value: "No match",                          explanation: "Not yet listed. Newly registered phishing domains frequently precede listing." },
    ],
  },
  {
    name: "Website / Page Analysis",
    rows: [
      { check: "Login form",          status: "CRITICAL",   value: "Detected — submits to 185.199.108.153", explanation: "Form action points to an external IP rather than the brand's own servers." },
      { check: "Password field",      status: "CRITICAL",   value: "Present",                          explanation: "Credential input field confirms the page is designed to harvest passwords." },
      { check: "External scripts",    status: "WARNING",    value: "4 external scripts",                explanation: "Scripts loaded from third-party domains outside the page's own origin." },
    ],
  },
  {
    name: "Brand Impersonation & Phishing",
    rows: [
      { check: "Visual similarity",   status: "CRITICAL",   value: "94% match to PayPal",              explanation: "Logo, color palette, and typography closely match the PayPal brand identity." },
      { check: "Brand keyword in domain", status: "CRITICAL",value: "login, update",                    explanation: "Brand-adjacent keywords combined in domain name — confirmed impersonation pattern." },
      { check: "Domain age",          status: "HIGH",       value: "12 days",                          explanation: "Freshly registered domain is consistent with disposable phishing infrastructure." },
    ],
  },
]
