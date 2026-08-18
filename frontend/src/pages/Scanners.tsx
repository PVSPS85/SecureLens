import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import {
  QrCode, Mail, Smartphone, Upload, Camera,
  Shield, CheckCircle, ArrowRight, Info, Search as SearchIcon,
  ChevronLeft, AlertTriangle,
} from "lucide-react"
import { cn } from "../lib/utils"

type ScannerType = "qr" | "email" | "phone"
type RiskLevel   = "low" | "medium" | "high" | "critical"

import {
  ScanItem,
  QR_CHECKS,
  EMAIL_CHECKS,
  PHONE_CHECKS,
  RECENT_QR,
  RECENT_EMAIL,
  RECENT_PHONE,
  PHONE_SCAN_STEPS,
  EMAIL_SCAN_STEPS,
  DEMO_EMAIL,
  QR_DEMO_URL
} from "../lib/mockData"

/* ─── shared types ─── */
function ScanRow({ item }: { item: ScanItem }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-xs text-foreground truncate">{item.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={item.risk}>{item.risk.toUpperCase()}</Badge>
        <span className={cn("text-xs font-semibold tabular-nums", {
          "text-risk-low-text": item.risk === "low",
          "text-risk-medium-text": item.risk === "medium",
          "text-risk-high-text": item.risk === "high",
          "text-risk-critical-text": item.risk === "critical",
        })}>{item.score}/100</span>
      </div>
    </div>
  )
}

/* ─── tool card data ─── */
const TOOLS: { id: ScannerType; icon: React.ElementType; title: string; description: string; checks: string[]; accent: string }[] = [
  { id: "qr",    icon: QrCode,     title: "QR Scanner",    description: "Upload or capture a QR code. SecureLens extracts the embedded URL and runs the full security scan against the destination.",  checks: QR_CHECKS,    accent: "bg-blue-50 text-blue-600"   },
  { id: "email", icon: Mail,       title: "Email Scanner",  description: "Paste raw email content or headers to detect phishing indicators, spoofed senders, malicious links, and authentication failures.", checks: EMAIL_CHECKS, accent: "bg-violet-50 text-violet-600" },
  { id: "phone", icon: Smartphone, title: "Phone Scanner",  description: "Check a suspicious phone number for reported scam activity, fraud history, geographic origin, and spoofing risk.",               checks: PHONE_CHECKS, accent: "bg-amber-50 text-amber-600"  },
]

/* ═══════════════════════════════════════════
   QR SCANNER
═══════════════════════════════════════════ */
type QRState = "idle" | "decoding" | "decoded" | "camera" | "camera-detected"

function QRScannerView() {
  const navigate = useNavigate()
  const [qrState, setQRState] = useState<QRState>("idle")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  useEffect(() => () => clearTimer(), [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setQRState("decoding")
    timerRef.current = setTimeout(() => setQRState("decoded"), 1800)
  }

  const startCamera = () => {
    setQRState("camera")
    timerRef.current = setTimeout(() => setQRState("camera-detected"), 2800)
  }

  const reset = () => {
    clearTimer()
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setQRState("idle")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const scanURL = () => navigate(`/?target=${encodeURIComponent(QR_DEMO_URL)}`)

  /* ── camera scanning state ── */
  if (qrState === "camera") {
    return (
      <div className="space-y-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Camera QR Scan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Scanning for a QR code…</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
            </div>

            {/* Camera viewfinder */}
            <div className="relative mx-auto flex items-center justify-center overflow-hidden rounded-xl bg-gray-900" style={{ maxWidth: 320, height: 240 }}>
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800/60 to-gray-900/80" />
              {/* Corner markers */}
              {[
                "top-5 left-5 border-t-2 border-l-2",
                "top-5 right-5 border-t-2 border-r-2",
                "bottom-5 left-5 border-b-2 border-l-2",
                "bottom-5 right-5 border-b-2 border-r-2",
              ].map((cls) => (
                <div key={cls} className={`absolute h-7 w-7 border-accent rounded-sm ${cls}`} />
              ))}
              {/* Pulsing scan area */}
              <div className="h-24 w-24 rounded-xl border-2 border-accent/60 animate-pulse" />
              <p className="absolute bottom-3 inset-x-0 text-center text-[10px] text-white/40">Prototype — simulated camera feed</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Hold a QR code in front of the camera. Detection is simulated in this prototype.
            </p>
          </CardContent>
        </Card>
        <BottomQRPanels />
      </div>
    )
  }

  /* ── decoding / decoded / camera-detected states ── */
  if (qrState === "decoding" || qrState === "decoded" || qrState === "camera-detected") {
    const isDone = qrState === "decoded" || qrState === "camera-detected"
    return (
      <div className="space-y-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {qrState === "decoding" ? "Decoding QR Code…" : "QR Code Decoded"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {qrState === "decoding"
                    ? "Extracting the embedded URL from your QR image."
                    : qrState === "camera-detected"
                    ? "QR code detected via camera."
                    : "URL successfully extracted from QR image."}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>← Back</Button>
            </div>

            {/* Image preview (upload flow) */}
            {imagePreview && (
              <div className="relative inline-block rounded-xl overflow-hidden border border-border bg-secondary" style={{ maxWidth: 160 }}>
                <img src={imagePreview} alt="Uploaded QR code" className="w-full h-auto object-contain" />
                {qrState === "decoding" && (
                  <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-1.5">
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-[10px] text-muted-foreground">Decoding…</p>
                  </div>
                )}
              </div>
            )}

            {/* Camera detection indicator */}
            {qrState === "camera-detected" && (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#10B981" }}>
                <CheckCircle className="h-4 w-4 shrink-0" />
                QR code detected via camera
              </div>
            )}

            {/* Decoded result */}
            {isDone && (
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">QR Detected — Embedded URL</p>
                </div>
                <p className="font-mono text-sm text-foreground font-semibold break-all">{QR_DEMO_URL}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Risk target:</span>
                  <span className="text-xs font-semibold bg-white border border-border text-foreground rounded px-1.5 py-0.5">URL</span>
                </div>
              </div>
            )}

            {isDone && (
              <div className="flex gap-2.5 flex-wrap">
                <Button onClick={scanURL}>
                  <QrCode className="h-4 w-4 mr-2" /> Scan URL
                </Button>
                <Button variant="outline" onClick={reset}>Scan another</Button>
              </div>
            )}

            {isDone && (
              <p className="text-xs text-muted-foreground">
                "Scan URL" hands off to the SecureLens scan workflow — you will see the analysis animation before the full report.
              </p>
            )}
          </CardContent>
        </Card>
        <BottomQRPanels />
      </div>
    )
  }

  /* ── idle state ── */
  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan a QR Code</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a QR image or use your camera. SecureLens extracts the embedded URL and runs a full security scan.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-7 text-center hover:border-primary/40 transition-colors cursor-pointer group"
            >
              <Upload className="h-7 w-7 text-muted-foreground group-hover:text-primary mx-auto mb-2.5 transition-colors" />
              <p className="text-sm font-medium text-foreground">Upload QR Image</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP · up to 10 MB</p>
            </button>
            <button
              onClick={startCamera}
              className="border-2 border-dashed border-border rounded-xl p-7 text-center hover:border-primary/40 transition-colors cursor-pointer group bg-secondary/30"
            >
              <Camera className="h-7 w-7 text-muted-foreground group-hover:text-primary mx-auto mb-2.5 transition-colors" />
              <p className="text-sm font-medium text-foreground">Use Camera</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time scanning (prototype)</p>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            After decoding, you will be prompted to scan the extracted URL through the SecureLens scan workflow.
          </p>
        </CardContent>
      </Card>
      <BottomQRPanels />
    </div>
  )
}

function BottomQRPanels() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Recent QR Scans</p>
          {RECENT_QR.map((s, i) => <ScanRow key={i} item={s} />)}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Supported Checks</p>
          <div className="space-y-2">
            {QR_CHECKS.map(c => (
              <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-[#10B981] shrink-0" /> {c}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   EMAIL SCANNER
═══════════════════════════════════════════ */
type EmailState = "idle" | "scanning" | "result"

function EmailScannerView() {
  const [emailState, setEmailState] = useState<EmailState>("idle")
  const [content, setContent] = useState("")
  const [scanStep, setScanStep] = useState(0)

  const startScan = () => { setScanStep(0); setEmailState("scanning") }
  const reset     = () => { setEmailState("idle"); setScanStep(0) }

  useEffect(() => {
    if (emailState !== "scanning") return
    const isLast = scanStep === EMAIL_SCAN_STEPS.length - 1
    const timer = setTimeout(() => {
      isLast ? setEmailState("result") : setScanStep(s => s + 1)
    }, isLast ? 650 : 370)
    return () => clearTimeout(timer)
  }, [emailState, scanStep])

  /* ── scanning animation ── */
  if (emailState === "scanning") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="max-w-sm mx-auto space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Scanning email…</span>
              </div>
              <p className="font-mono text-sm text-foreground font-semibold truncate">noreply@paypa1-secure.com</p>
            </div>
            <div className="space-y-1.5">
              {EMAIL_SCAN_STEPS.map((step, i) => {
                const done   = i < scanStep
                const active = i === scanStep
                return (
                  <div key={step} className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                    active ? "bg-primary/5 text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {done
                      ? <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#10B981" }} />
                      : active
                      ? <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      : <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                    }
                    {step}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ── result ── */
  if (emailState === "result") {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="text-center shrink-0">
                  <p className="text-4xl font-bold tabular-nums leading-none text-risk-critical-text">91</p>
                  <p className="text-xs text-muted-foreground mt-0.5">/ 100</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="critical">CRITICAL</Badge>
                    <span className="text-sm font-semibold text-foreground">Email Risk Score</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                    This email shows strong indicators of phishing and brand impersonation targeting PayPal users.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>{"← Scan another"}</Button>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-2.5">Key findings</p>
              <ul className="space-y-1.5">
                {[
                  "Sender domain resembles a legitimate brand (paypa1 vs paypal)",
                  "SPF, DKIM, and DMARC authentication all failed",
                  "Suspicious verification link points to lookalike domain",
                  "Urgency-based phishing language detected in body",
                  "Credential collection likely at the link destination",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-risk-critical shrink-0 mt-1.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Sender Analysis</p>
              <div className="space-y-2">
                {[
                  { label: "From address",  value: "noreply@paypa1-secure.com", bad: true,  note: ""          },
                  { label: "Sender domain", value: "paypa1-secure.com",         bad: true,  note: ""          },
                  { label: "Display name",  value: "PayPal Security",           bad: false, note: "(spoofed)" },
                  { label: "Reply-To",      value: "support@paypa1-update.net", bad: true,  note: ""          },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-muted-foreground shrink-0 w-24">{row.label}</span>
                    <span className={cn("font-mono text-right break-all", row.bad ? "text-risk-critical-text" : "text-foreground")}>
                      {row.value}
                      {row.note && <span className="text-muted-foreground font-sans ml-1">{row.note}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-risk-critical-bg px-3 py-2 text-xs text-risk-critical-text">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Reply-To mismatch — replies go to a different domain than the sender
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Email Authentication</p>
              <div className="space-y-3">
                {[
                  { check: "SPF",   detail: "No valid SPF record for paypa1-secure.com" },
                  { check: "DKIM",  detail: "DKIM signature absent or invalid"           },
                  { check: "DMARC", detail: "DMARC policy: none — enforcement disabled"  },
                ].map(row => (
                  <div key={row.check} className="flex items-start gap-3 text-xs">
                    <div className="flex items-center gap-1.5 shrink-0 w-20">
                      <span className="font-bold text-risk-critical-text">{row.check}</span>
                      <Badge variant="critical" className="text-[9px] px-1">FAIL</Badge>
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{row.detail}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t border-border">
                All three mechanisms failed — strong indication this email was not sent from an authorized server.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Link Analysis</p>
              <div className="flex gap-5 text-xs">
                {[
                  { n: "2", label: "Total links",  cls: "text-foreground"             },
                  { n: "1", label: "Suspicious",   cls: "text-risk-critical-text"     },
                  { n: "1", label: "Redirect",     cls: "text-risk-high-text"         },
                ].map(s => (
                  <div key={s.label}>
                    <p className={cn("text-2xl font-bold tabular-nums", s.cls)}>{s.n}</p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
                <p className="font-mono text-xs text-risk-critical-text break-all">
                  https://paypa1-secure.com/verify?token=abc123
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] bg-risk-critical-bg text-risk-critical-text px-2 py-0.5 rounded-full">Lookalike domain</span>
                  <span className="text-[10px] bg-risk-high-bg text-risk-high-text px-2 py-0.5 rounded-full">Redirect detected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Content Analysis</p>
              <div className="space-y-2">
                {[
                  { label: "Phishing indicators",       value: "Detected", bad: true  },
                  { label: "Urgency / threat language", value: "Detected", bad: true  },
                  { label: "Credential request",        value: "Likely",   bad: true  },
                  { label: "Payment-related content",   value: "None",     bad: false },
                  { label: "Brand impersonation",       value: "PayPal",   bad: true  },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={cn("font-semibold", row.bad ? "text-risk-critical-text" : "text-[#10B981]")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Attachments</p>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#10B981" }}>
                <CheckCircle className="h-4 w-4 shrink-0" />
                No attachments detected
              </div>
              <p className="text-xs text-muted-foreground">This email did not contain any file attachments.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Recommended Action</p>
              <p className="text-sm font-semibold text-risk-critical-text">Do not click links or provide credentials.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mark this email as phishing and delete it. If you already clicked a link, change your PayPal password immediately and enable two-factor authentication.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Recent Email Scans</p>
            {RECENT_EMAIL.map((s, i) => <ScanRow key={i} item={s} />)}
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ── idle ── */
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan an Email</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Paste raw email content or headers to detect phishing, spoofed senders, and malicious links.
            </p>
          </div>
          <textarea
            rows={8}
            placeholder={"Paste email content or headers here…\n\nFrom: noreply@paypa1-secure.com\nTo: user@gmail.com\nSubject: Urgent: Your account has been locked\n\nDear customer,\nYour account will be closed unless you verify…\n\nhttps://paypa1-secure.com/verify"}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button disabled={!content.trim()} onClick={startScan}>
              <Mail className="h-4 w-4 mr-2" /> Scan Email
            </Button>
            <button
              onClick={() => setContent(DEMO_EMAIL)}
              className="text-xs text-primary underline underline-offset-2 hover:opacity-75"
            >
              Try demo email
            </button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Recent Email Scans</p>
            {RECENT_EMAIL.map((s, i) => <ScanRow key={i} item={s} />)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Supported Checks</p>
            <div className="space-y-2">
              {EMAIL_CHECKS.map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-[#10B981] shrink-0" /> {c}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PHONE SCANNER
═══════════════════════════════════════════ */
type PhoneState = "idle" | "scanning" | "result"

const COUNTRIES: { code: string; label: string; example: string }[] = [
  { code: "US", label: "US (+1)",    example: "+1 (555) 867-5309"  },
  { code: "IN", label: "IN (+91)",   example: "+91 98765 43210"    },
  { code: "UK", label: "UK (+44)",   example: "+44 7700 900123"    },
  { code: "CA", label: "CA (+1)",    example: "+1 (416) 555-0199"  },
  { code: "AU", label: "AU (+61)",   example: "+61 4 1234 5678"    },
  { code: "DE", label: "DE (+49)",   example: "+49 1512 3456789"   },
  { code: "FR", label: "FR (+33)",   example: "+33 6 12 34 56 78"  },
  { code: "BR", label: "BR (+55)",   example: "+55 11 91234-5678"  },
  { code: "JP", label: "JP (+81)",   example: "+81 90-1234-5678"   },
  { code: "SG", label: "SG (+65)",   example: "+65 9123 4567"      },
]

function PhoneScannerView() {
  const [phoneState, setPhoneState] = useState<PhoneState>("idle")
  const [phone, setPhone]           = useState("")
  const [country, setCountry]       = useState("US")
  const [scanStep, setScanStep]     = useState(0)
  const [scannedPhone, setScannedPhone] = useState("")

  const selectedCountry = COUNTRIES.find(c => c.code === country) ?? COUNTRIES[0]

  const startScan = () => {
    setScannedPhone(phone)
    setScanStep(0)
    setPhoneState("scanning")
  }

  const reset = () => { setPhoneState("idle"); setScanStep(0); setPhone("") }

  useEffect(() => {
    if (phoneState !== "scanning") return
    const isLast = scanStep === PHONE_SCAN_STEPS.length - 1
    const timer = setTimeout(() => {
      isLast ? setPhoneState("result") : setScanStep(s => s + 1)
    }, isLast ? 700 : 320)
    return () => clearTimeout(timer)
  }, [phoneState, scanStep])

  /* ── scanning animation ── */
  if (phoneState === "scanning") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="max-w-sm mx-auto space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Scanning phone number…</span>
              </div>
              <p className="font-mono text-sm text-foreground font-semibold">{scannedPhone}</p>
            </div>
            <div className="space-y-1.5">
              {PHONE_SCAN_STEPS.map((step, i) => {
                const done   = i < scanStep
                const active = i === scanStep
                return (
                  <div key={step} className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                    active ? "bg-primary/5 text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {done
                      ? <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#10B981" }} />
                      : active
                      ? <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      : <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                    }
                    {step}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ── result ── */
  if (phoneState === "result") {
    const signals = [
      { label: "Valid number format",          sev: "low",      pass: true  },
      { label: "Country and carrier resolved", sev: "low",      pass: true  },
      { label: "Multiple spam reports",        sev: "medium",   pass: false },
      { label: "Suspicious calling reputation",sev: "medium",   pass: false },
      { label: "Scam reports detected",        sev: "high",     pass: false },
      { label: "Spoofing risk indicator",      sev: "medium",   pass: false },
    ]
    return (
      <div className="space-y-4">
        {/* Risk header */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="text-center shrink-0">
                  <p className="text-4xl font-bold tabular-nums leading-none text-risk-high-text">78</p>
                  <p className="text-xs text-muted-foreground mt-0.5">/ 100</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="high">HIGH</Badge>
                    <span className="text-sm font-semibold text-foreground">Phone Security Result</span>
                  </div>
                  <p className="font-mono text-sm text-foreground font-medium mb-1">{scannedPhone}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                    This number shows multiple indicators associated with spam and potential scam activity.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>{"← Scan another"}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Number information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Number Information</p>
              <div className="space-y-2">
                {[
                  { label: "Country",       value: "India"                        },
                  { label: "Region",        value: "Karnataka"                    },
                  { label: "Line type",     value: "Mobile"                       },
                  { label: "Carrier",       value: "Illustrative Telecom Provider" },
                  { label: "Validity",      value: "Valid"                        },
                  { label: "Number type",   value: "Mobile"                       },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs gap-4">
                    <span className="text-muted-foreground shrink-0">{row.label}</span>
                    <span className="text-foreground font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground border-t border-border pt-2.5">
                Carrier and region data are illustrative. No private ownership information is disclosed.
              </p>
            </CardContent>
          </Card>

          {/* Reputation & reports */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Reputation &amp; Reports</p>
              <div className="flex gap-4 flex-wrap">
                {[
                  { n: "31", label: "Spam reports",          cls: "text-risk-medium-text" },
                  { n: "18", label: "Scam reports",          cls: "text-risk-high-text"   },
                  { n: "7",  label: "Fraud reports",         cls: "text-risk-critical-text"},
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={cn("text-2xl font-bold tabular-nums", s.cls)}>{s.n}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-1 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last reported</span>
                  <span className="text-foreground font-medium">2 days ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Overall reputation</span>
                  <span className="text-risk-high-text font-semibold">Suspicious</span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {["Scam calls", "OTP / verification scams", "Spam calls"].map(cat => (
                  <span key={cat} className="text-[10px] bg-risk-high-bg text-risk-high-text px-2 py-0.5 rounded-full">{cat}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security signals */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Security Signals</p>
              <div className="space-y-2">
                {signals.map(sig => (
                  <div key={sig.label} className="flex items-center gap-2.5 text-xs">
                    {sig.pass
                      ? <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#10B981" }} />
                      : <span className={cn("h-3.5 w-3.5 rounded-full shrink-0 flex items-center justify-center", {
                          "bg-risk-medium/20": sig.sev === "medium",
                          "bg-risk-high/20":   sig.sev === "high",
                        })}>
                          <AlertTriangle className={cn("h-2.5 w-2.5", {
                            "text-risk-medium-text": sig.sev === "medium",
                            "text-risk-high-text":   sig.sev === "high",
                          })} />
                        </span>
                    }
                    <span className={sig.pass ? "text-muted-foreground" : cn({
                      "text-foreground":         sig.sev === "medium",
                      "text-risk-high-text":     sig.sev === "high",
                    })}>{sig.label}</span>
                    {!sig.pass && (
                      <Badge variant={sig.sev as RiskLevel} className="ml-auto text-[9px] px-1.5">
                        {sig.sev.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended action */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Recommended Action</p>
              <p className="text-sm font-semibold text-risk-high-text">
                Treat with caution — potential scam risk.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Do not share OTPs, passwords, banking details, or payment information with this number.
              </p>
              <div className="space-y-1.5 pt-1 border-t border-border">
                {["Block this number on your device", "Avoid responding to calls or messages", "Report to your carrier if you received a suspicious call"].map(action => (
                  <div key={action} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0 mt-1" />
                    {action}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent phone scans */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Recent Phone Scans</p>
            {RECENT_PHONE.map((s, i) => <ScanRow key={i} item={s} />)}
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ── idle ── */
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan a Phone Number</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Check a phone number for security and reputation signals — spam, scam, fraud, and spoofing indicators.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <input
              type="tel"
              placeholder={selectedCountry.example}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring min-w-0"
            />
            <Button disabled={!phone.trim()} onClick={startScan} className="shrink-0">
              <Smartphone className="h-4 w-4 mr-2" /> Scan Phone
            </Button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Try example:</span>
            {[
              { country: "IN", phone: "+91 98765 43210" },
              { country: "US", phone: "+1 (555) 867-5309" },
            ].map(ex => (
              <button
                key={ex.phone}
                onClick={() => { setCountry(ex.country); setPhone(ex.phone) }}
                className="text-xs text-primary underline underline-offset-2 hover:opacity-75"
              >
                {ex.phone}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Recent Phone Scans</p>
            {RECENT_PHONE.map((s, i) => <ScanRow key={i} item={s} />)}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Supported Checks</p>
            <div className="space-y-2">
              {PHONE_CHECKS.map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-[#10B981] shrink-0" /> {c}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   OVERVIEW HUB
═══════════════════════════════════════════ */
function OverviewHub({ onOpen }: { onOpen: (id: ScannerType) => void }) {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
        <SearchIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">URL, Domain &amp; IP Scanning</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Full security scans of URLs, domains, and IP addresses — including DNS, TLS, threat intelligence, redirects, and visual evidence — are handled by the main <strong>Quick Scan</strong> on the Dashboard.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="shrink-0">
          Quick Scan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map(tool => (
          <Card key={tool.id} className="flex flex-col">
            <CardContent className="p-5 flex flex-col flex-1 gap-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", tool.accent)}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{tool.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
              <div className="space-y-1.5">
                {tool.checks.slice(0, 4).map(c => (
                  <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-[#10B981] shrink-0" /> {c}
                  </div>
                ))}
                {tool.checks.length > 4 && (
                  <p className="text-[10px] text-muted-foreground pl-5">+{tool.checks.length - 4} more checks</p>
                )}
              </div>
              <Button size="sm" onClick={() => onOpen(tool.id)} className="w-full mt-auto">
                Open {tool.title} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 px-4 py-3">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Privacy &amp; Demo Notice:</strong> In this prototype, submitted content is not transmitted to any backend and no real analysis is performed. All results shown are illustrative demo data. In a production system, submitted information would be processed securely over TLS and retained only for the duration of the analysis.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════ */
export function Scanners() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawType = searchParams.get("type")
  const VALID: ScannerType[] = ["qr", "email", "phone"]
  const activeScanner: ScannerType | null = VALID.includes(rawType as ScannerType) ? (rawType as ScannerType) : null

  const openScanner  = (id: ScannerType) => setSearchParams({ type: id })
  const closeScanner = () => setSearchParams({})

  const activeTool = TOOLS.find(t => t.id === activeScanner)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Specialized Scanners</h1>
          <p className="text-muted-foreground mt-1 text-sm">Additional scanning tools for QR codes, emails, and phone numbers.</p>
        </div>
        {activeTool && (
          <Button variant="ghost" size="sm" onClick={closeScanner}>
            <ChevronLeft className="h-4 w-4 mr-1" /> All Scanners
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      {activeTool && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={closeScanner} className="hover:text-foreground transition-colors">Scanners</button>
          <span>/</span>
          <span className="text-foreground font-medium">{activeTool.title}</span>
        </div>
      )}

      {/* Content */}
      {!activeScanner              && <OverviewHub onOpen={openScanner} />}
      {activeScanner === "qr"      && <QRScannerView />}
      {activeScanner === "email"   && <EmailScannerView />}
      {activeScanner === "phone"   && <PhoneScannerView />}

      {/* Prototype notice */}
      {activeScanner && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 px-4 py-3">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Prototype notice:</strong> No data is transmitted in this demo. All results are illustrative. In production, submitted content would be processed securely over TLS.
          </p>
        </div>
      )}
    </div>
  )
}
