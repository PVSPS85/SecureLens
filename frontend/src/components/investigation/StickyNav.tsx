import React, { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { sections } from "./data"

const dotColor: Record<string, string> = {
  pass: "bg-risk-low",
  warning: "bg-risk-medium",
  suspicious: "bg-risk-high",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
  unavailable: "bg-muted-foreground/40",
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function StickyNav() {
  const [active, setActive] = useState(sections[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "-20% 0px -70% 0px" },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Desktop: vertical sticky rail */}
      <nav className="sticky top-4 hidden xl:block">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sections
        </p>
        <ul className="space-y-0.5">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  active === s.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor[s.status])} />
                {s.navLabel}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tablet/mobile: horizontal scroll strip */}
      <nav className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-background/90 px-4 py-2 backdrop-blur xl:hidden sm:-mx-6 sm:px-6">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active === s.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[s.status])} />
              {s.navLabel}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
