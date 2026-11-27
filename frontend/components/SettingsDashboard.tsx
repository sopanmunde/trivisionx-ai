"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  User, Palette, Key, Shield, Zap, CreditCard, Bell,
  Save, Sun, Moon, Monitor,
  RefreshCw, Laptop, ArrowLeft, Plus, Trash2, CheckCircle2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

type SettingsTab = "profile" | "appearance" | "models" | "security" | "integrations" | "billing" | "notifications"

export function SettingsDashboard({ onNavigateToChat }: { onNavigateToChat?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [isSaving, setIsSaving] = useState(false)

  // Real User Profile State populated from GET /api/me
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    timezone: "UTC",
    plan: "Free",
    authProvider: "password",
    emailVerified: false,
  })

  // Real Stored Provider Keys (masked values returned by GET /api/brain/keys)
  const [storedKeys, setStoredKeys] = useState<Array<{ id: string; providerId: string; label: string; key: string; isActive: boolean }>>([])
  const [newKeyProvider, setNewKeyProvider] = useState("openai")
  const [newKeyLabel, setNewKeyLabel] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")

  // Real Telemetry Totals
  const [usageStats, setUsageStats] = useState({ totalTokens: 0, totalRequests: 0, docCount: 0 })

  // Model Preferences persisted to localStorage
  const [modelSettings, setModelSettings] = useState({
    defaultModel: "Gemini 2.5 Flash",
    temperature: "0.2",
    maxTokens: "4096",
  })

  // Real Slack/Integration Webhook Config
  const [webhooks, setWebhooks] = useState({
    slackUrl: "",
    slackChannel: "#research-reports",
    teamsUrl: "",
  })

  // Notification & UI Preferences persisted locally
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    slackPush: false,
    weeklyDigest: false,
  })
  const [compactDensity, setCompactDensity] = useState(false)

  const loadSettingsData = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token || token === "demo_guest_token" || localStorage.getItem("is_demo") === "true") return
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [meRes, keysRes, intRes, statsRes, docsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/me`, { headers }),
        fetch(`${API_BASE_URL}/brain/keys`, { headers }),
        fetch(`${API_BASE_URL}/integrations`, { headers }),
        fetch(`${API_BASE_URL}/brain/telemetry/stats`, { headers }),
        fetch(`${API_BASE_URL}/documents`, { headers }),
      ])

      if (meRes.ok) {
        const data = await meRes.json()
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          timezone: data.timezone || "UTC",
          plan: data.plan || "Free",
          authProvider: data.auth_provider || "password",
          emailVerified: Boolean(data.email_verified),
        })
      }
      if (keysRes.ok) {
        const keysData = await keysRes.json()
        if (Array.isArray(keysData)) setStoredKeys(keysData)
      }
      if (intRes.ok) {
        const intData = await intRes.json()
        setWebhooks({
          slackUrl: intData?.slack?.webhookUrl || "",
          slackChannel: intData?.slack?.channelName || "#research-reports",
          teamsUrl: intData?.teams?.webhookUrl || "",
        })
        setNotifications((prev) => ({ ...prev, slackPush: Boolean(intData?.slack?.webhookUrl) }))
      }
      let totalTokens = 0
      let totalRequests = 0
      if (statsRes.ok) {
        const s = await statsRes.json()
        totalTokens = s.totalTokens ?? 0
        totalRequests = s.totalRequests ?? 0
      }
      let docCount = 0
      if (docsRes.ok) {
        const docs = await docsRes.json()
        docCount = Array.isArray(docs) ? docs.length : 0
      }
      setUsageStats({ totalTokens, totalRequests, docCount })
    } catch (err) {
      console.error("Failed loading workspace settings", err)
    }
  }

  useEffect(() => {
    loadSettingsData()
    try {
      const savedPrefs = localStorage.getItem("trivisionx_ui_prefs")
      if (savedPrefs) {
        const p = JSON.parse(savedPrefs)
        if (typeof p.compactDensity === "boolean") setCompactDensity(p.compactDensity)
        if (p.modelSettings) setModelSettings(p.modelSettings)
        if (p.notifications) setNotifications(p.notifications)
      }
    } catch {}
  }, [])

  const handleAddKey = async () => {
    const token = localStorage.getItem("token")
    if (!token || token === "demo_guest_token") {
      toast.error("Sign in to add API keys.")
      return
    }
    if (!newKeyLabel.trim() || !newKeyValue.trim()) {
      toast.error("Please provide both a label and API key.")
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/brain/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: newKeyProvider,
          label: newKeyLabel.trim(),
          key: newKeyValue.trim(),
          isActive: true,
        }),
      })
      if (!res.ok) throw new Error("Failed to save API key")
      const created = await res.json()
      setStoredKeys((prev) => [...prev, created])
      setNewKeyLabel("")
      setNewKeyValue("")
      toast.success("Encrypted API key saved")
    } catch (e: any) {
      toast.error(e.message || "Failed to save key")
    }
  }

  const handleDeleteKey = async (id: string) => {
    const token = localStorage.getItem("token")
    if (!token || token === "demo_guest_token") return
    try {
      const res = await fetch(`${API_BASE_URL}/brain/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setStoredKeys((prev) => prev.filter((k) => k.id !== id))
        toast.success("API key removed")
      }
    } catch {
      toast.error("Failed to remove API key")
    }
  }

  const handleSaveSettings = async () => {
    const token = localStorage.getItem("token")
    if (!token || token === "demo_guest_token") {
      toast.error("Sign in to persist account settings.")
      return
    }
    setIsSaving(true)
    try {
      const profileRes = await fetch(`${API_BASE_URL}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profile.firstName,
          last_name: profile.lastName,
          username: profile.username || undefined,
          bio: profile.bio,
          timezone: profile.timezone,
        }),
      })
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}))
        throw new Error(err.detail || "Failed to update profile")
      }

      if (webhooks.slackUrl && !webhooks.slackUrl.includes("•")) {
        await fetch(`${API_BASE_URL}/integrations/slack`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            webhookUrl: webhooks.slackUrl,
            channelName: webhooks.slackChannel || "#research-reports",
          }),
        })
      }

      try {
        localStorage.setItem(
          "trivisionx_ui_prefs",
          JSON.stringify({ compactDensity, modelSettings, notifications })
        )
      } catch {}

      toast.success("Settings saved to your account", {
        description: "Profile, preferences, and integrations have been updated.",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative flex-1 overflow-y-auto bg-background p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dashboard Sub-Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              {onNavigateToChat && (
                <button
                  onClick={onNavigateToChat}
                  className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Assistant
                </button>
              )}
              {onNavigateToChat && <span>/</span>}
              <span className="text-foreground font-semibold">Dashboard Settings</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              System & Workspace Preferences
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your personal profile, model API keys, security policies, and workspace notifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveSettings}
              className="gap-2 font-semibold shadow-xs h-8 text-xs"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>

        {/* Main Settings Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sub-Navigation Sidebar (Left) */}
          <div className="lg:col-span-3">
            <Card className="p-2 border-border bg-card">
              <nav className="space-y-1 font-mono text-xs">
                {[
                  { id: "profile", label: "Profile & Account", icon: User },
                  { id: "appearance", label: "Appearance", icon: Palette },
                  { id: "models", label: "API Keys & Models", icon: Key },
                  { id: "security", label: "Security & Auth", icon: Shield },
                  { id: "integrations", label: "Integrations & Webhooks", icon: Zap },
                  { id: "billing", label: "Billing & Plan", icon: CreditCard },
                  { id: "notifications", label: "Notifications", icon: Bell },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as SettingsTab)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Settings Content Area (Right) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. Profile Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Profile & Account Settings</CardTitle>
                  <CardDescription className="text-xs">
                    Update your workspace display identity, avatar, and contact email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold border border-border shadow-xs">
                      {((profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")).toUpperCase() || profile.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {`${profile.firstName} ${profile.lastName}`.trim() || profile.username || "Workspace User"}
                      </h4>
                      <p className="text-xs text-muted-foreground">{profile.email || "Not signed in"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        readOnly
                        disabled
                        className="h-9 text-xs opacity-75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-xs">Bio &amp; Role</Label>
                      <Input
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Role or workspace focus..."
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="timezone" className="text-xs">Timezone</Label>
                      <Input
                        id="timezone"
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-border pt-3">
                  <Button size="sm" className="h-8 text-xs" onClick={handleSaveSettings}>Save Profile</Button>
                </CardFooter>
              </Card>
            )}

            {/* 2. Appearance Tab */}
            {activeTab === "appearance" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Appearance & Theme</CardTitle>
                  <CardDescription className="text-xs">
                    Customize your dashboard interface theme, density, and animation preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                      Color Theme Mode
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "light", label: "Light", icon: Sun, desc: "Bright dashboard" },
                        { id: "dark", label: "Dark", icon: Moon, desc: "Dark enterprise" },
                        { id: "system", label: "System", icon: Monitor, desc: "OS default" },
                      ].map((t) => {
                        const Icon = t.icon
                        const isActive = theme === t.id
                        return (
                          <Card
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`p-3.5 cursor-pointer transition-all border ${
                              isActive
                                ? "border-primary ring-1 ring-ring bg-accent/30"
                                : "border-border hover:border-accent-foreground/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <Icon className="w-4 h-4 text-primary" />
                              {isActive && <Badge variant="default" className="text-[8px] px-1 py-0">Active</Badge>}
                            </div>
                            <h5 className="font-bold text-xs text-foreground">{t.label}</h5>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">Compact Density</h4>
                        <p className="text-[11px] text-muted-foreground">Reduce panel spacing for high-density monitoring displays.</p>
                      </div>
                      <Switch checked={compactDensity} onCheckedChange={setCompactDensity} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. API Keys & Models Tab */}
            {activeTab === "models" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Encrypted BYOK Provider Keys</CardTitle>
                  <CardDescription className="text-xs">
                    Manage stored provider API credentials (encrypted on backend, returned masked).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {storedKeys.length > 0 ? (
                    <div className="space-y-2">
                      {storedKeys.map((k) => (
                        <div key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{k.label}</span>
                              <Badge variant="outline" className="text-[10px] font-mono uppercase">{k.providerId}</Badge>
                            </div>
                            <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{k.key}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteKey(k.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No custom API keys stored yet. Add one below to override backend default environment keys.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-border">
                    <Input
                      value={newKeyProvider}
                      onChange={(e) => setNewKeyProvider(e.target.value)}
                      placeholder="Provider (openai, google...)"
                      className="h-9 text-xs font-mono"
                    />
                    <Input
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      placeholder="Key label"
                      className="h-9 text-xs"
                    />
                    <Input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="Paste secret key..."
                      className="h-9 text-xs font-mono"
                    />
                    <Button size="sm" className="h-9 text-xs gap-1.5" onClick={handleAddKey}>
                      <Plus className="w-3.5 h-3.5" /> Add Key
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="defaultModel" className="text-xs">Preferred Model Label</Label>
                      <Input
                        id="defaultModel"
                        value={modelSettings.defaultModel}
                        onChange={(e) => setModelSettings({ ...modelSettings, defaultModel: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="temp" className="text-xs">Temperature</Label>
                      <Input
                        id="temp"
                        value={modelSettings.temperature}
                        onChange={(e) => setModelSettings({ ...modelSettings, temperature: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="maxTokens" className="text-xs">Max Tokens Limit</Label>
                      <Input
                        id="maxTokens"
                        value={modelSettings.maxTokens}
                        onChange={(e) => setModelSettings({ ...modelSettings, maxTokens: e.target.value })}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-border pt-3">
                  <Button size="sm" className="h-8 text-xs" onClick={handleSaveSettings}>Save Preferences</Button>
                </CardFooter>
              </Card>
            )}

            {/* 4. Security Tab */}
            {activeTab === "security" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Security &amp; Authentication Status</CardTitle>
                  <CardDescription className="text-xs">
                    Account verification and active browser session details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">Authentication Provider</h4>
                      <p className="text-[11px] text-muted-foreground capitalize">{profile.authProvider} sign-in</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {profile.emailVerified ? "Verified Email" : "Unverified Email"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-foreground">Current Browser Session</h4>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Laptop className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">
                            {typeof navigator !== "undefined" ? navigator.userAgent : "Active Web Client"}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Authenticated Bearer JWT session
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[9px] px-1.5 py-0 shrink-0">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. Integrations & Webhooks Tab */}
            {activeTab === "integrations" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Configured Export Webhooks</CardTitle>
                  <CardDescription className="text-xs">
                    Update Slack webhook settings or visit Integrations Hub for Teams, Notion, Confluence &amp; Jira.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 font-mono text-xs">
                    <Label htmlFor="slackUrl" className="text-xs">Slack Incoming Webhook URL</Label>
                    <Input
                      id="slackUrl"
                      value={webhooks.slackUrl}
                      onChange={(e) => setWebhooks({ ...webhooks, slackUrl: e.target.value })}
                      placeholder="https://hooks.slack.com/services/..."
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <Label htmlFor="slackChannel" className="text-xs">Default Slack Channel</Label>
                    <Input
                      id="slackChannel"
                      value={webhooks.slackChannel}
                      onChange={(e) => setWebhooks({ ...webhooks, slackChannel: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-border pt-3">
                  <Button size="sm" className="h-8 text-xs" onClick={handleSaveSettings}>Save Integration</Button>
                </CardFooter>
              </Card>
            )}

            {/* 6. Billing Tab */}
            {activeTab === "billing" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Plan &amp; Metered Workspace Usage</CardTitle>
                  <CardDescription className="text-xs">
                    Live usage totals aggregated from your MongoDB telemetry &amp; document library.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge variant="default" className="mb-1.5 text-[9px] uppercase">{profile.plan} Plan</Badge>
                      <h3 className="font-extrabold text-lg text-foreground">BYOK Workspace</h3>
                      <p className="text-xs text-muted-foreground">Bring your own provider API keys or manage tier limits on the pricing page.</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                      <a href="/pricing">View Plans</a>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg border border-border bg-muted/20">
                      <span className="text-muted-foreground block text-[10px]">Cumulative Tokens</span>
                      <span className="text-base font-bold text-foreground">{usageStats.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/20">
                      <span className="text-muted-foreground block text-[10px]">Logged API Calls</span>
                      <span className="text-base font-bold text-foreground">{usageStats.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/20">
                      <span className="text-muted-foreground block text-[10px]">Indexed Documents</span>
                      <span className="text-base font-bold text-foreground">{usageStats.docCount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7. Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">
                    Configure workspace alerts and Slack export notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">Calendar Email Reminders</h4>
                      <p className="text-[11px] text-muted-foreground">Dispatch scheduled event reminders when configured per calendar item.</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(c) => setNotifications({ ...notifications, emailAlerts: c })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">Slack Webhook Connected</h4>
                      <p className="text-[11px] text-muted-foreground">Status reflects whether a Slack Incoming Webhook URL is configured.</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {webhooks.slackUrl ? "Configured" : "Not Set"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
