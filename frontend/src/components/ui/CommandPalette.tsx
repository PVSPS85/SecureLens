import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import { Search, Globe, LayoutDashboard, History, FileText, QrCode, Settings, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface PaletteItem {
  type: string
  name: string
  href: string
  icon: React.ElementType
  subtitle?: string
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [recentScans, setRecentScans] = useState<Array<any>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 100)
      
      // Fetch live recent scans
      fetch("http://localhost:5001/api/v1/scans/recent?limit=5")
        .then(res => res.json())
        .then(json => {
          if (Array.isArray(json?.data)) {
            setRecentScans(json.data)
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const items: PaletteItem[] = [
    { type: "page", name: "Dashboard", href: "/", icon: LayoutDashboard },
    { type: "page", name: "Lookalike Detection", href: "/discovery", icon: Globe },
    { type: "page", name: "Scan History", href: "/history", icon: History },
    { type: "page", name: "Reports", href: "/reports", icon: FileText },
    { type: "page", name: "QR Scanner", href: "/scanners?type=qr", icon: QrCode },
    { type: "page", name: "Settings", href: "/settings", icon: Settings },
    ...recentScans.map(scan => ({
      type: "scan",
      name: scan.target,
      href: `/investigate/${scan.id}`,
      icon: Search,
      subtitle: `Risk: ${(scan.risk_level || "LOW").toUpperCase()} · Score: ${scan.risk_score ?? 0}`
    }))
  ]

  const filteredItems = query.trim() === "" 
    ? items.slice(0, 6)
    : items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (href: string) => {
    onClose()
    navigate(href)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all mx-4">
        <div className="relative flex items-center border-b border-border px-4 py-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search pages, previous scans, or enter a domain..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (filteredItems.length > 0) {
                  handleSelect(filteredItems[0].href)
                } else if (query.trim()) {
                  handleSelect(`/?target=${encodeURIComponent(query.trim())}`)
                }
              }
            }}
          />
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map((item, i) => (
                <button
                  key={`${item.type}-${item.name}-${i}`}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-secondary transition-colors group"
                  onClick={() => handleSelect(item.href)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary/80 group-hover:bg-white border border-transparent group-hover:border-border transition-colors">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                    {item.subtitle && <span className="text-[10px] text-muted-foreground truncate">{item.subtitle}</span>}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 shrink-0">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm">
              <Globe className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium">Scan new target: <span className="font-mono bg-secondary px-1.5 py-0.5 rounded ml-1">{query}</span></p>
              <p className="text-muted-foreground text-xs mt-1">Press Enter to launch investigation</p>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-secondary/30 px-4 py-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-border rounded px-1.5 py-0.5 font-mono shadow-sm text-[9px]">↑</kbd><kbd className="bg-white border border-border rounded px-1.5 py-0.5 font-mono shadow-sm text-[9px]">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-border rounded px-1.5 py-0.5 font-mono shadow-sm text-[9px]">Enter</kbd> to select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="bg-white border border-border rounded px-1.5 py-0.5 font-mono shadow-sm text-[9px]">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
export default CommandPalette
