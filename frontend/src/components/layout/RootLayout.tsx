import React, { useState, useEffect, useRef } from "react"
import { Outlet, NavLink, useLocation, useNavigate } from "react-router"
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  Globe,
  History,
  FileText,
  QrCode,
  Mail,
  Smartphone,
  Settings as SettingsIcon,
  Bell,
  Menu,
  X,
  Bot,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { CommandPalette } from "../ui/CommandPalette"

function getAuthUser(): { name: string; email: string } | null {
  try { const raw = localStorage.getItem("sl_auth"); return raw ? JSON.parse(raw) : null }
  catch { return null }
}

export function RootLayout() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [authUser, setAuthUser] = useState<{ name: string; email: string } | null>(getAuthUser)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [isSecureAIOpen, setIsSecureAIOpen] = useState(false)
  const [secureAIInput, setSecureAIInput] = useState("")
  const [secureAILoading, setSecureAILoading] = useState(false)
  const [secureAIError, setSecureAIError] = useState(false)
  const [secureAIMessages, setSecureAIMessages] = useState<{
    role: "ai" | "user"
    text: string
    chips?: string[]
  }[]>([
    { role: "ai", text: "I have full context on this investigation. Ask me anything about the evidence, findings, or recommended actions." }
  ])
  const location = useLocation()
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const isMac = typeof window !== "undefined" && navigator.userAgent.toUpperCase().indexOf("MAC") >= 0
  const shortcutKey = isMac ? "⌘K" : "Ctrl K"

  // Re-read auth when the route changes (handles post-login redirect)
  useEffect(() => { setAuthUser(getAuthUser()) }, [location.pathname])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [userMenuOpen])

  // Cmd+K shortcut for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdPaletteOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("sl_auth")
    setAuthUser(null)
    setUserMenuOpen(false)
    navigate("/")
  }

  const navigation = [
    { name: "Dashboard",          href: "/",          icon: LayoutDashboard },
    { name: "Lookalike Detection", href: "/discovery", icon: Globe           },
    { name: "Scan History",       href: "/history",   icon: History         },
    { name: "Reports",            href: "/reports",   icon: FileText        },
  ]

  const scanners = [
    { name: "QR Scanner",    href: "/scanners?type=qr",    icon: QrCode      },
    { name: "Email Scanner", href: "/scanners?type=email", icon: Mail        },
    { name: "Phone Scanner", href: "/scanners?type=phone", icon: Smartphone  },
  ]

  const QUICK_ACTIONS = [
    "Why is this website risky?",
    "Show the strongest evidence.",
    "Explain this finding in simple terms.",
    "Is it safe to continue?",
    "What should I do next?",
  ]

  const MOCK_RESPONSES: Record<string, { text: string; chips?: string[] }> = {
    "Why is this website risky?": {
      text: "SecureLens identified several indicators associated with phishing:\n\n1. Brand impersonation detected — 94% visual match to PayPal\n2. Credential-harvesting form submitting to external IP 185.199.108.153\n3. Suspicious redirect chain crossing to a different domain\n4. Confirmed match on threat intelligence feeds\n\nThese findings together contribute to the Critical risk score of 98/100.",
      chips: ["Phishing", "Website", "Threat Intel", "Redirects"],
    },
    "Show the strongest evidence.": {
      text: "Strongest finding: CREDENTIAL HARVESTING FORM DETECTED.\n\nThe page contains an HTML form that submits email and password fields to an external IP (185.199.108.153) rather than paypal.com. Combined with a 94% visual similarity score and a domain registered 12 days ago, this is a high-confidence phishing attack.",
      chips: ["Website", "Phishing"],
    },
    "Explain this finding in simple terms.": {
      text: "This website is impersonating a trusted service to steal your password. It looks like a real PayPal login page, but anything you type goes directly to attackers — not PayPal. Do not enter any information and close the tab immediately.",
      chips: ["Phishing", "Website"],
    },
    "Is it safe to continue?": {
      text: "No. This website is critically dangerous.\n\nVisiting the page passively is low risk, but submitting any information — email, password, card details — will send your data directly to threat actors. The domain should be blocked at the network level.",
      chips: ["Threat Intel", "Website"],
    },
    "What should I do next?": {
      text: "Recommended actions based on this investigation:\n\n1. Do not interact with or revisit the website\n2. Block the domain at your network or DNS level\n3. Report to anti-phishing authorities (PhishTank, APWG)\n4. If the link was distributed to others, issue a warning\n5. Export the full investigation report for your records",
      chips: ["Threat Intel"],
    },
  }

  const addAIResponse = (userText: string, response: { text: string; chips?: string[] }) => {
    setSecureAILoading(true)
    setSecureAIError(false)
    setSecureAIMessages(msgs => [...msgs, { role: "user", text: userText }])
    setTimeout(() => {
      if (Math.random() < 0.05) {
        setSecureAIError(true)
        setSecureAILoading(false)
        return
      }
      setSecureAIMessages(msgs => [...msgs, { role: "ai", text: response.text, chips: response.chips }])
      setSecureAILoading(false)
    }, 1400)
  }

  const handleQuickAction = (action: string) => {
    const response = MOCK_RESPONSES[action] ?? {
      text: "Based on the current investigation evidence, this website shows strong indicators of credential-harvesting phishing activity. All risk indicators are consistent with a coordinated threat campaign.",
    }
    addAIResponse(action, response)
  }

  const handleSend = () => {
    if (!secureAIInput.trim()) return
    const text = secureAIInput
    setSecureAIInput("")
    addAIResponse(text, {
      text: "Based on the current investigation evidence, this website shows strong indicators of credential-harvesting phishing activity. The domain was registered 12 days ago and matches known phishing campaign infrastructure. All risk indicators support the Critical risk classification.",
      chips: ["Threat Intel", "Phishing"],
    })
  }

  const SIDEBAR_W = isExpanded ? 256 : 56

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ElementType } }) => {
    const isActive = item.href.includes("?")
      ? location.pathname + location.search === item.href
      : location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
    return (
      <li>
        <NavLink
          to={item.href}
          title={!isExpanded ? item.name : undefined}
          className={cn(
            isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5",
            "group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-colors",
            !isExpanded && "justify-center"
          )}
        >
          <item.icon
            className={cn(
              isActive ? "text-accent" : "text-white/70 group-hover:text-white",
              "h-5 w-5 shrink-0"
            )}
          />
          {isExpanded && <span className="truncate">{item.name}</span>}
        </NavLink>
      </li>
    )
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between px-3 border-b border-white/10">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="h-7 w-7 text-accent shrink-0" />
          {(isExpanded || mobile) && (
            <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">SecureLens</span>
          )}
        </div>
        {!mobile && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3 hide-scrollbar">
        <ul role="list" className="flex flex-1 flex-col gap-y-5">
          <li>
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </li>
          <li>
            {(isExpanded || mobile) && (
              <div className="text-[10px] font-semibold leading-6 text-white/40 uppercase tracking-wider mb-1 px-2">
                Scanners
              </div>
            )}
            {(!isExpanded && !mobile) && <div className="border-t border-white/10 my-1" />}
            <ul role="list" className="space-y-0.5">
              {scanners.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </li>
          <li className="mt-auto">
            <ul role="list" className="space-y-0.5">
              <li>
                <NavLink
                  to="/extension"
                  title={!isExpanded ? "Browser Extension" : undefined}
                  className={cn(
                    "text-white/70 hover:text-white hover:bg-white/5 group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-colors",
                    !isExpanded && "justify-center"
                  )}
                >
                  <Globe className="h-5 w-5 shrink-0 text-white/70 group-hover:text-white" />
                  {isExpanded && "Browser Extension"}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  title={!isExpanded ? "Settings" : undefined}
                  className={cn(
                    "text-white/70 hover:text-white hover:bg-white/5 group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-colors",
                    !isExpanded && "justify-center"
                  )}
                >
                  <SettingsIcon className="h-5 w-5 shrink-0 text-white/70 group-hover:text-white" />
                  {isExpanded && "Settings"}
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className={cn("flex items-center", isExpanded || mobile ? "gap-x-3" : "justify-center")}>
          <img
            className="h-8 w-8 rounded-full bg-white/10 shrink-0"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          />
          {(isExpanded || mobile) && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">Alex Security</span>
              <span className="text-xs text-white/50">Pro Plan</span>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-64 flex-col bg-primary">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <SidebarContent mobile />
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col bg-primary overflow-hidden"
        style={{ width: SIDEBAR_W, transition: "width 0.2s ease" }}
      >
        <SidebarContent />
      </div>

      {/* Main content area */}
      <div
        className="flex flex-1 flex-col"
        style={{ paddingLeft: SIDEBAR_W, transition: "padding-left 0.2s ease" }}
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div 
              className="relative flex flex-1 items-center cursor-pointer group"
              onClick={() => setCmdPaletteOpen(true)}
            >
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
              <div className="pl-8 text-sm text-gray-400 group-hover:text-gray-500 w-full flex items-center justify-between transition-colors">
                <span>Search pages, domains, IP addresses...</span>
                <kbd className="hidden sm:inline-block rounded border border-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-400 group-hover:border-gray-300">{shortcutKey}</kbd>
              </div>
            </div>
            <div className="flex items-center gap-x-3 lg:gap-x-4">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <Button
                size="sm"
                onClick={() => {
                  if (location.pathname === "/") {
                    document.getElementById("quick-investigate-input")?.focus()
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  } else {
                    navigate("/?focus=1")
                  }
                }}
              >
                New Scan
              </Button>

              {/* Auth controls */}
              {authUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-secondary transition-colors"
                  >
                    <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="hidden lg:block text-xs font-medium text-foreground max-w-[110px] truncate">
                      {authUser.name}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-border bg-white shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-xs font-semibold text-foreground truncate">{authUser.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{authUser.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* SecureAI Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isSecureAIOpen ? (
          <div className="glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl" style={{ width: 348, maxHeight: 520 }}>
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-white leading-none">SecureAI</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Ask about this investigation</p>
                </div>
              </div>
              <button onClick={() => setIsSecureAIOpen(false)} className="text-white/50 hover:text-white mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 hide-scrollbar">
              {secureAIMessages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line",
                    msg.role === "ai" ? "bg-white/10 text-white/85" : "bg-accent/20 text-white self-end max-w-[85%]"
                  )}>
                    {msg.text}
                  </div>
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-white/30 self-center">Evidence:</span>
                      {msg.chips.map(chip => (
                        <span key={chip} className="text-[10px] bg-white/10 border border-white/15 text-white/60 px-2 py-0.5 rounded-full">{chip}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}
              {secureAILoading && (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2.5">
                  <span className="flex gap-0.5">
                    {[0,1,2].map(i => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                  <span className="text-[11px] text-white/50">SecureAI is analyzing the investigation evidence…</span>
                </div>
              )}

              {/* Error */}
              {secureAIError && !secureAILoading && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-white/50">SecureAI couldn't generate an explanation right now.</span>
                  <button
                    onClick={() => { setSecureAIError(false) }}
                    className="text-[11px] text-accent hover:underline ml-2 shrink-0"
                  >Try Again</button>
                </div>
              )}

              {/* Quick actions — shown only when 1 message (the initial greeting) */}
              {secureAIMessages.length === 1 && !secureAILoading && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-white/30 px-0.5">Suggested questions</p>
                  <div className="flex flex-col gap-1">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="text-left rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secureAIInput}
                  onChange={(e) => setSecureAIInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !secureAILoading && handleSend()}
                  placeholder="Ask about this investigation…"
                  disabled={secureAILoading}
                  className="flex-1 bg-white/10 border border-white/20 rounded-md py-1.5 px-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={secureAILoading || !secureAIInput.trim()}
                  className="bg-accent text-[#1E293B] text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-white/25 leading-snug">SecureAI explains the investigation evidence. It does not replace the underlying security checks.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsSecureAIOpen(true)}
            className="h-12 w-12 rounded-full bg-primary text-accent shadow-lg border border-white/10 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Bot className="h-5 w-5" />
          </button>
        )}
      </div>
      {/* Command Palette Modal */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
    </div>
  )
}
