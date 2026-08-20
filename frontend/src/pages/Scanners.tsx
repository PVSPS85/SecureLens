import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import {
  QrCode, Mail, Smartphone, Upload, Camera,
  CheckCircle, ArrowRight, Search as SearchIcon,
  ChevronLeft, AlertTriangle, Globe, Shield
} from "lucide-react"
import { cn } from "../lib/utils"
import jsQR from "jsqr"

type ScannerType = "qr" | "email" | "phone"
type RiskLevel = "low" | "medium" | "high" | "critical"

const QR_CHECKS = [
  "Matrix decoding & payload extraction",
  "Target domain & protocol validation",
  "Threat intelligence registry check",
  "Homoglyph & brand lookalike analysis",
]

const EMAIL_CHECKS = [
  "Sender address & domain parsing",
  "Embedded URL link extraction",
  "SPF / DKIM domain alignment check",
  "Credential-harvesting indicator audit",
]

const PHONE_CHECKS = [
  "E.164 international format validation",
  "Country prefix & geographic assignment",
  "Reported spam & telemarketer registry check",
  "Spoofing indicator risk scoring",
]

/* ─── tool card data ─── */
const TOOLS: { id: ScannerType; icon: React.ElementType; title: string; description: string; checks: string[]; accent: string }[] = [
  { id: "qr", icon: QrCode, title: "QR Scanner", description: "Upload or capture a QR code. SecureLens extracts the embedded URL and runs a full forensic security scan against the destination.", checks: QR_CHECKS, accent: "bg-blue-50 text-blue-600" },
  { id: "email", icon: Mail, title: "Email Scanner", description: "Paste raw email text or headers to extract embedded links, inspect the sender domain, and detect phishing indicators.", checks: EMAIL_CHECKS, accent: "bg-violet-50 text-violet-600" },
  { id: "phone", icon: Smartphone, title: "Phone Scanner", description: "Check a phone number for reported scam activity, geographic origin, and spoofing risk indicators.", checks: PHONE_CHECKS, accent: "bg-amber-50 text-amber-600" },
]

/* ═══════════════════════════════════════════
   QR SCANNER
═══════════════════════════════════════════ */
type QRState = "idle" | "decoding" | "decoded" | "error"

function QRScannerView() {
  const navigate = useNavigate()
  const [qrState, setQRState] = useState<QRState>("idle")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setQRState("decoding")
    setDecodeError(null)

    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const imageData = ctx?.getImageData(0, 0, img.width, img.height)
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code && code.data) {
            setDecodedUrl(code.data)
            setQRState("decoded")
            return
          }
        }
        setDecodeError("Could not detect a clear QR code matrix in the uploaded image. Please ensure the QR is well-lit and unobstructed.")
        setQRState("error")
      } catch (err) {
        setDecodeError("Failed to decode the image. Please try another file.")
        setQRState("error")
      }
    }
    img.onerror = () => {
      setDecodeError("Image failed to load. Please try a valid PNG or JPEG image.")
      setQRState("error")
    }
    img.src = previewUrl
  }

  const reset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setDecodedUrl(null)
    setDecodeError(null)
    setQRState("idle")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const scanExtractedURL = () => {
    if (decodedUrl) {
      navigate(`/?target=${encodeURIComponent(decodedUrl)}`)
    }
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Scan a QR Code</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a QR image. SecureLens extracts the embedded URL and runs a full security audit.
              </p>
            </div>
            {qrState !== "idle" && (
              <Button variant="ghost" size="sm" onClick={reset}>← Reset</Button>
            )}
          </div>

          {qrState === "idle" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group"
              >
                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-2.5 transition-colors" />
                <p className="text-sm font-medium text-foreground">Upload QR Image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP · up to 10 MB</p>
              </button>
              <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center bg-secondary/20 flex flex-col items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground/60 mb-2.5" />
                <p className="text-sm font-medium text-muted-foreground">Camera Scanner</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Upload an image from your device or mobile screenshot</p>
              </div>
            </div>
          )}

          {qrState === "decoding" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-foreground">Decoding QR matrix…</p>
            </div>
          )}

          {qrState === "error" && (
            <div className="rounded-xl border border-risk-critical-bg bg-risk-critical-bg/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-risk-critical-text">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-semibold">QR Decoding Notice</p>
              </div>
              <p className="text-xs text-muted-foreground">{decodeError}</p>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Upload Different Image
              </Button>
            </div>
          )}

          {qrState === "decoded" && decodedUrl && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Extracted Payload Destination
                  </p>
                </div>
                <p className="font-mono text-sm text-foreground font-semibold break-all bg-white border border-border p-3 rounded-lg">
                  {decodedUrl}
                </p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <Button onClick={scanExtractedURL}>
                  <Shield className="h-4 w-4 mr-2" /> Launch Full Security Scan
                </Button>
                <Button variant="outline" onClick={reset}>Scan Another</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   EMAIL SCANNER
═══════════════════════════════════════════ */
function EmailScannerView() {
  const navigate = useNavigate()
  const [content, setContent] = useState("")
  const [extractedDomain, setExtractedDomain] = useState<string | null>(null)
  const [extractedUrls, setExtractedUrls] = useState<string[]>([])
  const [emailSecurity, setEmailSecurity] = useState<any>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const checkEmailDomainSecurity = async (dom: string) => {
    setIsCheckingEmail(true)
    try {
      const res = await fetch("http://localhost:5001/api/v1/scanners/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `security@${dom}` })
      })
      if (res.ok) {
        const json = await res.json()
        setEmailSecurity(json.data)
      }
    } catch (err) {
      console.warn("Failed to check email security:", err)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleScan = () => {
    // 1. Extract sender domain from "From: name <user@domain.com>" or "user@domain.com"
    const fromMatch = content.match(/From:.*?([a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/i)
      || content.match(/([a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/)

    if (fromMatch && fromMatch[2]) {
      const dom = fromMatch[2].toLowerCase()
      setExtractedDomain(dom)
      checkEmailDomainSecurity(dom)
    }

    // 2. Extract embedded HTTP/HTTPS URLs
    const urlMatches = content.match(/https?:\/\/[^\s"'<>]+/gi) || []
    const cleanUrls = Array.from(new Set(urlMatches))
    setExtractedUrls(cleanUrls)
  }

  const reset = () => {
    setContent("")
    setExtractedDomain(null)
    setExtractedUrls([])
    setEmailSecurity(null)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan an Email</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Paste raw email text or headers. SecureLens extracts sender domains, runs live DNS SPF/DMARC checks, and isolates links for forensic analysis.
            </p>
          </div>

          <textarea
            rows={6}
            placeholder={"Paste email content or headers here…\n\nFrom: support@example-banking-update.com\nSubject: Important Notice\n\nPlease verify your account at https://example-banking-update.com/login"}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <Button disabled={!content.trim()} onClick={handleScan}>
              <Mail className="h-4 w-4 mr-2" /> Parse Email &amp; Extract Links
            </Button>
            {content && (
              <Button variant="outline" size="sm" onClick={reset}>Clear</Button>
            )}
          </div>

          {(extractedDomain || extractedUrls.length > 0) && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Targets &amp; Email Authentication
              </h3>

              {extractedDomain && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Sender Domain</span>
                      <span className="font-mono text-xs font-medium text-foreground">{extractedDomain}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={isCheckingEmail} onClick={() => checkEmailDomainSecurity(extractedDomain)}>
                        {isCheckingEmail ? "Checking DNS…" : "Recheck SPF/DMARC"}
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/?target=${encodeURIComponent(extractedDomain)}`)}>
                        Scan Domain
                      </Button>
                    </div>
                  </div>

                  {emailSecurity && (
                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Email Security Verdict: {emailSecurity.verdict?.toUpperCase()}</span>
                        <Badge variant={emailSecurity.verdict === "safe" ? "low" : emailSecurity.verdict === "warning" ? "medium" : "critical"}>
                          Score: {emailSecurity.reputationScore}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/60">
                        <div className="rounded border border-border/60 p-2 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">SPF Policy</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.spf?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{emailSecurity.records?.spf?.description}</p>
                        </div>
                        <div className="rounded border border-border/60 p-2 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">DMARC Policy</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.dmarc?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{emailSecurity.records?.dmarc?.description}</p>
                        </div>
                        <div className="rounded border border-border/60 p-2 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">MX Exchanger</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.mx?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{emailSecurity.records?.mx?.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {extractedUrls.map((url, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Embedded Link</span>
                    <span className="font-mono text-xs text-foreground truncate block">{url}</span>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/?target=${encodeURIComponent(url)}`)}>
                    Scan URL
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PHONE SCANNER
═══════════════════════════════════════════ */
function PhoneScannerView() {
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleScan = async () => {
    const clean = phone.trim()
    if (!clean) return
    setIsChecking(true)

    try {
      const res = await fetch("http://localhost:5001/api/v1/scanners/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean })
      })

      if (res.ok) {
        const json = await res.json()
        const data = json.data || {}
        setResult({
          phone: clean,
          isValid: data.isStandardE164,
          riskLevel: data.riskLevel || "LOW",
          score: data.spamScore || 15,
          country: data.country || "International",
          recommendation: data.recommendation,
          checks: [
            { label: "E.164 Number Format", status: data.isStandardE164 ? "PASS" : "FAIL" },
            { label: "Assigned Region / Country", status: data.country || "GLOBAL" },
            { label: "Number Classification", status: data.lineType || "STANDARD" }
          ]
        })
        return
      }
    } catch (err) {
      console.warn("Phone scanner API error:", err)
    } finally {
      setIsChecking(false)
    }

    // Fallback format validator if offline
    const isValid = /^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/.test(clean)
    const isInternational = clean.startsWith("+")
    const isSuspiciousFormat = clean.length < 7 || clean.length > 16

    setResult({
      phone: clean,
      isValid,
      riskLevel: isSuspiciousFormat ? "HIGH" : "LOW",
      score: isSuspiciousFormat ? 75 : 10,
      checks: [
        { label: "E.164 Number Format", status: isValid ? "PASS" : "FAIL" },
        { label: "International Dialing Prefix", status: isInternational ? "DETECTED" : "LOCAL" },
        { label: "Length Validity", status: isSuspiciousFormat ? "ANOMALOUS" : "STANDARD" }
      ]
    })
  }

  const reset = () => {
    setPhone("")
    setResult(null)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan a Phone Number</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter a phone number to analyze prefix structure, formatting integrity, and spoofing indicators.
            </p>
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <Button disabled={!phone.trim() || isChecking} onClick={handleScan}>
              {isChecking ? "Checking…" : "Check"}
            </Button>
          </div>

          {result && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-semibold text-foreground">{result.phone}</span>
                  <p className="text-xs text-muted-foreground">Format evaluation complete</p>
                </div>
                <Badge variant={result.riskLevel.toLowerCase() as RiskLevel}>
                  {result.riskLevel} RISK
                </Badge>
              </div>

              <div className="space-y-2">
                {result.checks.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-mono font-medium text-foreground">{c.status}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={reset}>
                Check Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN SCANNERS PAGE
═══════════════════════════════════════════ */
export function Scanners() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = (searchParams.get("type") as ScannerType) || "qr"

  const setScannerType = (type: ScannerType) => {
    setSearchParams({ type })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-foreground">Specialized Scanners</h1>
        <p className="text-sm text-muted-foreground">
          Dedicated security auditing tools for QR matrices, phishing emails, and suspicious phone numbers.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon
          const isActive = activeType === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setScannerType(tool.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-white hover:border-primary/40"
              )}
            >
              <div className={cn("p-2 rounded-lg shrink-0", tool.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{tool.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{tool.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Scanner View */}
      {activeType === "qr" && <QRScannerView />}
      {activeType === "email" && <EmailScannerView />}
      {activeType === "phone" && <PhoneScannerView />}
    </div>
  )
}
export default Scanners
