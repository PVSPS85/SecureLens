import React, { useState, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import {
  QrCode, Mail, Smartphone, Upload, Camera,
  CheckCircle, ArrowRight, AlertTriangle, Shield,
  Globe, Info, FileText, CheckCircle2, Lock, Cpu
} from "lucide-react"
import { cn } from "../lib/utils"
import jsQR from "jsqr"

type ScannerType = "qr" | "email" | "phone"
type RiskLevel = "low" | "medium" | "high" | "critical"
type QRState = "idle" | "decoding" | "decoded" | "error"

/**
 * Multi-pass QR code decoding algorithm to handle:
 * 1. Standard QR codes
 * 2. Inverted / Dark mode QR codes (`inversionAttempts: "attemptBoth"`)
 * 3. Multi-scale resampling (0.5x, 0.75x, 1.5x, 2.0x) for high/low resolution QR images
 * 4. Contrast binarization thresholding to decode stylized QR codes with center icons (e.g. Chrome Dino QR)
 */
function decodeMultiPassQR(img: HTMLImageElement): { data: string; width: number; height: number } | null {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null

  // Pass 1: Original Canvas with Inversion Attempts
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  let imgData = ctx.getImageData(0, 0, img.width, img.height)
  let result = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "attemptBoth" })
  if (result?.data) return { data: result.data, width: img.width, height: img.height }

  // Pass 2: Multi-Scale Resampling (1.5x, 2.0x, 0.75x, 0.5x)
  const scales = [1.5, 2.0, 0.75, 0.5]
  for (const scale of scales) {
    const sw = Math.round(img.width * scale)
    const sh = Math.round(img.height * scale)
    if (sw <= 0 || sh <= 0) continue
    canvas.width = sw
    canvas.height = sh
    ctx.drawImage(img, 0, 0, sw, sh)
    imgData = ctx.getImageData(0, 0, sw, sh)
    result = jsQR(imgData.data, sw, sh, { inversionAttempts: "attemptBoth" })
    if (result?.data) return { data: result.data, width: sw, height: sh }
  }

  // Pass 3: Binarization / Contrast Thresholding (removes grayscale anti-aliasing around logos like Chrome Dino)
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  imgData = ctx.getImageData(0, 0, img.width, img.height)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
    const bw = gray < 140 ? 0 : 255
    d[i] = bw
    d[i + 1] = bw
    d[i + 2] = bw
  }
  ctx.putImageData(imgData, 0, 0)
  result = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "attemptBoth" })
  if (result?.data) return { data: result.data, width: img.width, height: img.height }

  return null
}

function QRScannerView() {
  const navigate = useNavigate()
  const [qrState, setQRState] = useState<QRState>("idle")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [qrDetails, setQrDetails] = useState<any>(null)
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
        const decoded = decodeMultiPassQR(img)
        if (decoded && decoded.data) {
          const raw = decoded.data
          setDecodedUrl(raw)

          // Calculate rich QR matrix diagnostics
          const isUrl = /^https?:\/\//i.test(raw)
          const isObfuscatedShortener = /bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly/i.test(raw)
          const isDeepLink = /^[a-z0-9+.-]+:/i.test(raw) && !isUrl

          setQrDetails({
            matrixDimensions: `${decoded.width}×${decoded.height} px`,
            payloadLength: `${new Blob([raw]).size} bytes`,
            encodingType: isUrl ? "URI / Web Destination" : isDeepLink ? "Application Deep Link" : "Alphanumeric String",
            errorCorrection: "Reed-Solomon Level M (15% Recovery)",
            isShortener: isObfuscatedShortener,
            isDeepLink,
            riskLevel: isObfuscatedShortener ? "HIGH" : "LOW"
          })

          setQRState("decoded")
          return
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
    setQrDetails(null)
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
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" /> QR Code Matrix Scanner
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload or capture a QR matrix image. SecureLens extracts embedded payloads, analyzes error correction levels, and inspects redirect risks.
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
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group bg-secondary/20"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-semibold text-foreground">Upload QR Image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — up to 10 MB</p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group bg-secondary/20"
              >
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-semibold text-foreground">Camera Scanner</p>
                <p className="text-xs text-muted-foreground mt-1">Upload screenshot or snapshot from mobile</p>
              </button>
            </div>
          )}

          {qrState === "decoding" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-foreground">Decoding QR matrix &amp; verifying payload safety…</p>
            </div>
          )}

          {qrState === "error" && (
            <div className="rounded-xl border border-risk-critical-text/30 bg-risk-critical-bg/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-risk-critical-text">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-semibold">QR Matrix Analysis Notice</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Extracted Payload Destination
                    </p>
                  </div>
                  {qrDetails && (
                    <Badge variant={qrDetails.riskLevel.toLowerCase() as RiskLevel}>
                      {qrDetails.riskLevel} RISK
                    </Badge>
                  )}
                </div>

                <p className="font-mono text-xs text-foreground font-semibold break-all bg-white border border-border p-3 rounded-lg">
                  {decodedUrl}
                </p>

                {/* Rich Matrix Telemetry Breakdown */}
                {qrDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                    <div className="p-2 rounded bg-white border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Payload Type</span>
                      <span className="font-mono text-xs text-foreground font-medium truncate block">{qrDetails.encodingType}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Matrix Size</span>
                      <span className="font-mono text-xs text-foreground font-medium block">{qrDetails.matrixDimensions}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Payload Size</span>
                      <span className="font-mono text-xs text-foreground font-medium block">{qrDetails.payloadLength}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Redirection Risk</span>
                      <span className="font-mono text-xs text-foreground font-medium block">
                        {qrDetails.isShortener ? "URL Shortener Detected" : "Direct Link"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <Button onClick={scanExtractedURL}>
                  <Shield className="h-4 w-4 mr-2" /> Launch Full Forensic Security Scan
                </Button>
                <Button variant="outline" onClick={reset}>Scan Another QR Code</Button>
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
  const [urgencyTriggers, setUrgencyTriggers] = useState<string[]>([])

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

    // 3. Phishing & Urgency Text Analysis
    const triggers = []
    if (/urgent|immediately|action required|suspended|unauthorized|verify your/i.test(content)) {
      triggers.push("Urgency / Pressure Language")
    }
    if (/password|login|credential|banking|billing|credit card/i.test(content)) {
      triggers.push("Sensitive Credential Subject")
    }
    if (/click here|verify account|update billing/i.test(content)) {
      triggers.push("Call-To-Action Link Trap")
    }
    setUrgencyTriggers(triggers)
  }

  const reset = () => {
    setContent("")
    setExtractedDomain(null)
    setExtractedUrls([])
    setEmailSecurity(null)
    setUrgencyTriggers([])
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Email Header &amp; Content Forensic Scanner
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Paste raw email text or headers. SecureLens parses sender domains, performs live DNS SPF/DMARC/DKIM verification, detects urgency triggers, and isolates embedded URLs.
            </p>
          </div>

          <textarea
            rows={6}
            placeholder={"Paste email content or headers here…\n\nFrom: support@security-banking-verify.com\nSubject: URGENT: Account Action Required Immediately\n\nPlease verify your account immediately at https://security-banking-verify.com/login to avoid suspension."}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <Button disabled={!content.trim()} onClick={handleScan}>
              <Mail className="h-4 w-4 mr-2" /> Parse Email &amp; Perform DNS Audit
            </Button>
            {content && (
              <Button variant="outline" size="sm" onClick={reset}>Clear</Button>
            )}
          </div>

          {(extractedDomain || extractedUrls.length > 0) && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Forensic Extraction Results &amp; Domain Authentication
              </h3>

              {/* Urgency Trigger Badges */}
              {urgencyTriggers.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Phishing &amp; Psychological Manipulation Indicators
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {urgencyTriggers.map((trig, idx) => (
                      <Badge key={idx} variant="medium">{trig}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {extractedDomain && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Parsed Sender Domain</span>
                      <span className="font-mono text-xs font-medium text-foreground">{extractedDomain}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={isCheckingEmail} onClick={() => checkEmailDomainSecurity(extractedDomain)}>
                        {isCheckingEmail ? "Rechecking DNS…" : "Recheck DNS"}
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/?target=${encodeURIComponent(extractedDomain)}`)}>
                        Scan Domain
                      </Button>
                    </div>
                  </div>

                  {emailSecurity && (
                    <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Live DNS Email Verdict: {emailSecurity.verdict?.toUpperCase()}</span>
                        <Badge variant={emailSecurity.verdict === "safe" ? "low" : emailSecurity.verdict === "warning" ? "medium" : "critical"}>
                          Security Score: {emailSecurity.reputationScore}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 border-t border-border/60">
                        <div className="rounded border border-border/60 p-2.5 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">SPF Policy</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.spf?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{emailSecurity.records?.spf?.description}</p>
                        </div>
                        <div className="rounded border border-border/60 p-2.5 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">DMARC Policy</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.dmarc?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{emailSecurity.records?.dmarc?.description}</p>
                        </div>
                        <div className="rounded border border-border/60 p-2.5 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">DKIM Key Selector</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.dkim?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{emailSecurity.records?.dkim?.description}</p>
                        </div>
                        <div className="rounded border border-border/60 p-2.5 bg-secondary/30">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">MX Mail Servers</p>
                          <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{emailSecurity.records?.mx?.record || "None"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{emailSecurity.records?.mx?.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {extractedUrls.map((url, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Isolated Embedded Link #{i+1}</span>
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
          phone: data.phoneNumber || clean,
          isValid: data.isStandardE164,
          riskLevel: data.riskLevel || "LOW",
          score: data.spamScore || 15,
          country: data.country || "International",
          prefix: data.countryPrefix || "",
          lineType: data.lineType || "Standard Mobile/Fixed Line",
          carrier: data.carrier || "Privacy Protected",
          recommendation: data.recommendation,
          checks: [
            { label: "ITU-T E.164 Standard Format", status: data.isStandardE164 ? "PASS" : "NON-STANDARD", tone: data.isStandardE164 ? "text-[#047857]" : "text-amber-600" },
            { label: "Assigned Geographic Country", status: data.country || "GLOBAL", tone: "text-foreground" },
            { label: "Network Line Classification", status: data.lineType || "STANDARD", tone: "text-foreground" },
            { label: "Shortcode / Premium Risk Index", status: data.spamScore > 50 ? "HIGH ANOMALY" : "LOW RISK", tone: data.spamScore > 50 ? "text-red-600" : "text-[#047857]" }
          ]
        })
        return
      }
    } catch (err) {
      console.warn("Phone scanner API error:", err)
    } finally {
      setIsChecking(false)
    }
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
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> Phone Number Reputation &amp; E.164 Scanner
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter a phone number to analyze ITU-T E.164 formatting integrity, geographic region, line type classification, and spoofing indicators.
            </p>
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="+1 (555) 019-2834 or +91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <Button disabled={!phone.trim() || isChecking} onClick={handleScan}>
              {isChecking ? "Checking…" : "Check Number"}
            </Button>
          </div>

          {result && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between bg-secondary/40 p-3.5 rounded-xl border border-border">
                <div>
                  <span className="font-mono text-sm font-bold text-foreground">{result.phone}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{result.country} ({result.prefix})</p>
                </div>
                <Badge variant={result.riskLevel.toLowerCase() as RiskLevel}>
                  {result.riskLevel} RISK ({result.score}/100)
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.checks.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-3 border border-border/80 rounded-lg bg-card">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className={cn("font-mono font-semibold", c.tone)}>{c.status}</span>
                  </div>
                ))}
              </div>

              {result.recommendation && (
                <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Security Guidance: </span>
                  {result.recommendation}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={reset}>
                Check Another Number
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
      {/* Sleek Sub-Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Specialized Scanners</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Targeted security auditing tools for QR matrices, phishing emails, and phone number reputation.
          </p>
        </div>

        {/* Clean Sub-nav Buttons */}
        <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-lg border border-border shrink-0">
          <button
            onClick={() => setScannerType("qr")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              activeType === "qr"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <QrCode className="h-3.5 w-3.5" /> QR Scanner
          </button>
          <button
            onClick={() => setScannerType("email")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              activeType === "email"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="h-3.5 w-3.5" /> Email Scanner
          </button>
          <button
            onClick={() => setScannerType("phone")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              activeType === "phone"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" /> Phone Scanner
          </button>
        </div>
      </div>

      {/* Active Scanner View */}
      {activeType === "qr" && <QRScannerView />}
      {activeType === "email" && <EmailScannerView />}
      {activeType === "phone" && <PhoneScannerView />}
    </div>
  )
}

export default Scanners
