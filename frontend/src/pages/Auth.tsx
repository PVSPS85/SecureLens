import React, { useState } from "react"
import { useNavigate } from "react-router"
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "../components/ui/Button"

export function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      // @BACKEND-TODO: Integrate with authentication API endpoint (e.g. POST /api/auth/login)
      // - Validate credentials against user database
      // - Establish session (HttpOnly cookie or JWT)
      // - Replace this mock localStorage write with real user context from the backend
      localStorage.setItem("sl_auth", JSON.stringify({
        name: "Alex Security",
        email: email || "alex@company.com",
      }))
      setIsLoading(false)
      navigate("/")
    }, 800)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[420px] shrink-0 flex-col justify-between bg-primary px-10 py-12">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold text-white tracking-tight">SecureLens</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white leading-snug">
            Professional security investigation for the modern threat landscape.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Analyze URLs, domains, and IP addresses. Detect phishing, malware, and brand impersonation before they reach your users.
          </p>
        </div>
        <div className="space-y-2">
          {[
            "DNS & IP intelligence",
            "TLS & certificate inspection",
            "Threat intelligence feeds",
            "SecureAI investigation assistant",
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-white/50">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {f}
            </div>
          ))}
          <p className="text-[10px] text-white/30 pt-3">Prototype / Demo — illustrative data only</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-base font-bold text-foreground">SecureLens</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Access your SecureLens workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                // TODO(backend): Remove demo user fast-path in production
                localStorage.setItem("sl_auth", JSON.stringify({ name: "Demo User", email: "demo@securelens.io" }))
                navigate("/")
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Continue as demo user →
            </button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            Prototype — no real authentication. Any credentials accepted.
          </p>
        </div>
      </div>
    </div>
  )
}
