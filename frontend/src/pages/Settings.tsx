import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { User, Palette, Bell, Shield, Search, Bot, Database, Save, AlertTriangle, X } from "lucide-react"
import { cn } from "../lib/utils"

/* ─── primitives ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-border last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription className="text-xs">{description}</CardDescription>
    </CardHeader>
  )
}

/* ─── confirmation dialog ─── */
function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-border shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-risk-critical-bg rounded-lg shrink-0">
            <AlertTriangle className="h-4 w-4 text-risk-critical-text" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Clear Investigation History?</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This will permanently delete all investigation records, saved reports, and history. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="bg-risk-critical hover:bg-risk-critical/90 text-white" onClick={onConfirm}>
            Clear All History
          </Button>
        </div>
      </div>
    </div>
  )
}

const SECTIONS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "appearance",   label: "Appearance",    icon: Palette },
  { id: "notifications",label: "Notifications", icon: Bell },
  { id: "security",     label: "Security",      icon: Shield },
  { id: "investigation",label: "Investigation", icon: Search },
  { id: "ai",           label: "SecureAI",      icon: Bot },
  { id: "data",         label: "Data & History",icon: Database },
]

export function Settings() {
  const [active, setActive] = useState("profile")

  /* profile */
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  /* appearance */
  const [theme, setTheme]           = useState("light")
  const [compactTables, setCompactTables] = useState(false)
  const [techValues, setTechValues] = useState("monospace")

  /* notifications */
  const [notifInvestigation, setNotifInvestigation] = useState(true)
  const [notifCritical, setNotifCritical]           = useState(true)
  const [notifReport, setNotifReport]               = useState(true)
  const [notifAI, setNotifAI]                       = useState(false)

  /* security */
  const [twoFactor, setTwoFactor]         = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)

  /* investigation */
  const [saveHistory, setSaveHistory]       = useState(true)
  const [defaultView, setDefaultView]       = useState("full")
  const [autoReport, setAutoReport]         = useState(false)
  const [showTechEvidence, setShowTechEvidence] = useState(true)

  /* secureai */
  const [aiEnabled, setAiEnabled]           = useState(true)
  const [aiContext, setAiContext]            = useState(true)
  const [aiDetail, setAiDetail]             = useState("standard")
  const [aiConfirm, setAiConfirm]           = useState(false)

  /* data */
  const [retainHistory, setRetainHistory]   = useState(true)
  const [historyDays, setHistoryDays]       = useState("90")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared]               = useState(false)

  const handleClearHistory = () => {
    setShowClearConfirm(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div className="space-y-5">
      {showClearConfirm && (
        <ConfirmDialog
          onConfirm={handleClearHistory}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account preferences and system configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:w-44 shrink-0">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  active === s.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {s.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {active === "profile" && (
            <Card>
              <SectionHeader title="Profile" description="Your account information and contact details." />
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Avatar"
                    className="h-14 w-14 rounded-full border border-border"
                  />
                  <div>
                    <Button variant="outline" size="sm">Change photo</Button>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG or PNG, max 2 MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Full name",     value: "Alex Security",    type: "text"  },
                    { label: "Email",         value: "alex@company.com", type: "email" },
                    { label: "Organization",  value: "SecureCorp Ltd.",  type: "text"  },
                    { label: "Role",          value: "Security Analyst", type: "text"  },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Appearance ── */}
          {active === "appearance" && (
            <Card>
              <SectionHeader title="Appearance" description="Customize the look and feel of SecureLens." />
              <CardContent>
                <SettingRow label="Theme" description="Choose between light and dark mode.">
                  <select value={theme} onChange={e => setTheme(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="light">Light</option>
                    <option value="dark">Dark (coming soon)</option>
                    <option value="system">System</option>
                  </select>
                </SettingRow>
                <SettingRow label="Compact tables" description="Show more rows in investigation and discovery tables.">
                  <Toggle checked={compactTables} onChange={setCompactTables} />
                </SettingRow>
                <SettingRow label="Technical values" description="How IP addresses, hashes, and scores are displayed.">
                  <select value={techValues} onChange={e => setTechValues(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="monospace">Monospace</option>
                    <option value="standard">Standard</option>
                  </select>
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <Card>
              <SectionHeader title="Notifications" description="Configure when SecureLens alerts you." />
              <CardContent>
                <SettingRow label="Investigation completed" description="Alert when a submitted URL or domain finishes analysis.">
                  <Toggle checked={notifInvestigation} onChange={setNotifInvestigation} />
                </SettingRow>
                <SettingRow label="Critical risk detected" description="Immediate alert when a critical-risk finding is confirmed.">
                  <Toggle checked={notifCritical} onChange={setNotifCritical} />
                </SettingRow>
                <SettingRow label="Report generated" description="Notify when an investigation report is ready to export.">
                  <Toggle checked={notifReport} onChange={setNotifReport} />
                </SettingRow>
                <SettingRow label="SecureAI analysis completed" description="Alert when SecureAI finishes a contextual analysis.">
                  <Toggle checked={notifAI} onChange={setNotifAI} />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <Card>
              <SectionHeader title="Security" description="Manage your account security settings." />
              <CardContent>
                <SettingRow label="Password" description="Change your account password.">
                  <Button variant="outline" size="sm">Change Password</Button>
                </SettingRow>
                <SettingRow label="Active sessions" description="View and revoke sign-ins on other devices.">
                  <Button variant="outline" size="sm">View Sessions</Button>
                </SettingRow>
                <SettingRow
                  label="Two-factor authentication"
                  description={twoFactor ? "2FA is enabled. Your account requires a second factor to sign in." : "Require a verification code in addition to your password."}
                >
                  <div className="flex items-center gap-2">
                    {!twoFactor && (
                      <Button variant="outline" size="sm" onClick={() => setTwoFactor(true)}>Enable 2FA</Button>
                    )}
                    <Toggle checked={twoFactor} onChange={setTwoFactor} />
                  </div>
                </SettingRow>
                <SettingRow label="Session timeout" description="Automatically sign out after 30 minutes of inactivity.">
                  <Toggle checked={sessionTimeout} onChange={setSessionTimeout} />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {/* ── Investigation ── */}
          {active === "investigation" && (
            <Card>
              <SectionHeader title="Investigation Preferences" description="Control how investigations are run and displayed." />
              <CardContent>
                <SettingRow label="Save investigation history" description="Automatically save every investigation to your history.">
                  <Toggle checked={saveHistory} onChange={setSaveHistory} />
                </SettingRow>
                <SettingRow label="Default investigation view" description="Which section is shown first when opening an investigation.">
                  <select value={defaultView} onChange={e => setDefaultView(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="full">Full Report</option>
                    <option value="overview">Overview Only</option>
                    <option value="summary">Summary</option>
                  </select>
                </SettingRow>
                <SettingRow label="Automatic report creation" description="Generate a PDF report automatically when an investigation completes.">
                  <Toggle checked={autoReport} onChange={setAutoReport} />
                </SettingRow>
                <SettingRow label="Show technical evidence by default" description="Expand all evidence sections when opening an investigation.">
                  <Toggle checked={showTechEvidence} onChange={setShowTechEvidence} />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {/* ── SecureAI ── */}
          {active === "ai" && (
            <Card>
              <SectionHeader title="SecureAI Preferences" description="Configure the SecureAI investigation assistant." />
              <CardContent>
                <SettingRow label="SecureAI enabled" description="Show the SecureAI panel across all investigations.">
                  <Toggle checked={aiEnabled} onChange={setAiEnabled} />
                </SettingRow>
                <SettingRow label="Context-aware investigation mode" description="SecureAI automatically reads the current investigation context.">
                  <Toggle checked={aiContext} onChange={v => { if (aiEnabled) setAiContext(v) }} />
                </SettingRow>
                <SettingRow label="Response detail level" description="How much detail SecureAI includes in its explanations.">
                  <select value={aiDetail} onChange={e => setAiDetail(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!aiEnabled}>
                    <option value="concise">Concise</option>
                    <option value="standard">Standard</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </SettingRow>
                <SettingRow label="Confirm before AI analysis" description="Ask for confirmation before SecureAI analyzes sensitive evidence.">
                  <Toggle checked={aiConfirm} onChange={v => { if (aiEnabled) setAiConfirm(v) }} />
                </SettingRow>
                <div className="mt-3 rounded-lg bg-secondary px-4 py-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">About SecureAI: </strong>
                    SecureAI interprets investigation evidence. It does not replace the underlying security checks. The risk score is determined by the SecureLens analysis engine.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Data & History ── */}
          {active === "data" && (
            <Card>
              <SectionHeader title="Data & History" description="Manage your investigation history and data retention." />
              <CardContent>
                <SettingRow label="Investigation history" description="Keep investigation records in your account.">
                  <Toggle checked={retainHistory} onChange={setRetainHistory} />
                </SettingRow>
                <SettingRow label="Saved reports" description="Retain generated PDF reports in your account.">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Data retention period" description="How long to keep investigation records.">
                  <select value={historyDays} onChange={e => setHistoryDays(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">6 months</option>
                    <option value="365">1 year</option>
                    <option value="0">Forever</option>
                  </select>
                </SettingRow>
                <SettingRow label="Export data" description="Download a full archive of your investigations and reports.">
                  <Button variant="outline" size="sm">Export Data</Button>
                </SettingRow>
                <SettingRow label="Clear history" description="Permanently delete all investigation records and saved reports.">
                  {cleared ? (
                    <span className="text-xs text-[#047857]">History cleared.</span>
                  ) : (
                    <Button
                      variant="outline" size="sm"
                      className="text-risk-critical-text border-risk-critical/40 hover:bg-risk-critical-bg"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      Clear History
                    </Button>
                  )}
                </SettingRow>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
