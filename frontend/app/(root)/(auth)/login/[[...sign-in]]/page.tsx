"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Loader2, AlertCircle, ArrowLeft, Brain, Database, GitMerge, Terminal, CheckCircle2, Webhook } from "lucide-react"
import { TriVisionXLogo } from "@/components/TriVisionXLogo"
import { API_BASE_URL } from "@/lib/api"

interface FlowNodeProps {
  label: string
  icon: React.ElementType
  className: string
  activeColor: string
}

function FlowNode({ label, icon: Icon, className, activeColor }: FlowNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.65, scale: 1 }}
      whileHover={{ opacity: 1, scale: 1.03, borderColor: "rgba(168,85,247,0.35)", boxShadow: "0 0 15px rgba(168,85,247,0.15)" }}
      transition={{ duration: 0.5 }}
      className={`absolute hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-850 bg-card/40 backdrop-blur-md shadow-lg font-mono text-[10px] text-muted-foreground pointer-events-auto transition-all ${className}`}
    >
      <div className="p-1.5 rounded-lg bg-background/80 border border-border text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-zinc-200">{label}</span>
        <span className="text-[8px] text-muted-foreground flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${activeColor} animate-pulse`} />
          FLOW ACTIVE
        </span>
      </div>
    </motion.div>
  )
}

function BackgroundFlows() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <svg
        viewBox="0 0 1000 800"
        preserveAspectRatio="none"
        className="w-full h-full opacity-[0.25]"
      >
        <path
          d="M 100 150 Q 250 150 350 280 T 500 400"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 120 420 Q 280 420 380 400 T 500 400"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 100 680 Q 250 680 360 520 T 500 400"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <path
          d="M 500 400 Q 650 280 750 180 T 900 180"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 500 400 Q 620 400 720 480 T 900 500"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 500 400 Q 650 520 760 680 T 900 680"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Scattered Flow Node Cards */}
      <FlowNode
        label="Webhook Trigger"
        icon={Webhook}
        className="left-[6%] top-[15%]"
        activeColor="bg-purple-500"
      />
      <FlowNode
        label="NLP Classifier"
        icon={Brain}
        className="left-[10%] top-[45%]"
        activeColor="bg-blue-500"
      />
      <FlowNode
        label="Pinecone Search"
        icon={Database}
        className="left-[6%] top-[75%]"
        activeColor="bg-blue-400"
      />

      <FlowNode
        label="Router Branch"
        icon={GitMerge}
        className="right-[6%] top-[18%]"
        activeColor="bg-pink-500"
      />
      <FlowNode
        label="Python Sandbox"
        icon={Terminal}
        className="right-[10%] top-[50%]"
        activeColor="bg-amber-500"
      />
      <FlowNode
        label="Slack Dispatch"
        icon={CheckCircle2}
        className="right-[6%] top-[80%]"
        activeColor="bg-emerald-500"
      />
    </div>
  )
}

function getFriendlyErrorMessage(err: Error, defaultMsg: string): string {
  const msg = err.message || "";
  if (msg.includes("Failed to fetch") || msg.includes("Load failed") || msg.includes("fetch failed")) {
    return "Unable to connect to the server. Please check if the API backend is running.";
  }
  return msg || defaultMsg;
}

function getProviderFromParams(searchParams: any): string {
  const state = searchParams.get("state")
  if (!state) return "google"
  try {
    const parts = state.split(".")
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
      return payload.provider || "google"
    }
  } catch {
  }
  return state === "github" ? "github" : "google"
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [error, setError] = useState("")
  const [ssoCallbackState, setSsoCallbackState] = useState<{ active: boolean; provider: string }>({
    active: false,
    provider: "google",
  })

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) return

    const state = searchParams.get("state")
    const provider = getProviderFromParams(searchParams)

    setSsoCallbackState({ active: true, provider })

    window.history.replaceState({}, "", "/login")
    if (typeof window !== "undefined") localStorage.removeItem("oauth_provider")

    const exchangeCode = async () => {
      if (provider === "github") setIsGitHubLoading(true)
      else setIsGoogleLoading(true)
      setError("")
      try {
        const apiUrl = API_BASE_URL
        const res = await fetch(`${apiUrl}/auth/${provider}/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || `${provider} sign-in failed`)

        localStorage.setItem("token", data.access_token)
        localStorage.setItem("dashboard-selected-id", "new")
        document.cookie = `auth_token=${data.access_token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`
        router.push("/dashboard")
      } catch (err) {
        const e = err as Error
        setError(getFriendlyErrorMessage(e, `${provider} sign-in failed. Please try again.`))
        setSsoCallbackState({ active: false, provider })
      } finally {
        setIsGoogleLoading(false)
        setIsGitHubLoading(false)
      }
    }

    exchangeCode()
  }, [searchParams, router])

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError("")
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("oauth_provider", "google")
      }
      const apiUrl = API_BASE_URL
      const res = await fetch(`${apiUrl}/auth/google/login`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to get Google login URL")
      window.location.href = data.authorization_url
    } catch (err) {
      const e = err as Error
      setError(getFriendlyErrorMessage(e, "Google sign-in failed. Please try again."))
      setIsGoogleLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true)
    setError("")
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("oauth_provider", "github")
      }
      const apiUrl = API_BASE_URL
      const res = await fetch(`${apiUrl}/auth/github/login`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to get GitHub login URL")
      window.location.href = data.authorization_url
    } catch (err) {
      const e = err as Error
      setError(getFriendlyErrorMessage(e, "GitHub sign-in failed. Please try again."))
      setIsGitHubLoading(false)
    }
  }

  if (ssoCallbackState.active) {
    const provider = ssoCallbackState.provider === "github" ? "GitHub" : "Google"

    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
        {/* Background radial glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(113,113,122,0.4) 0%, rgba(82,82,91,0.15) 50%, transparent 70%)" }}
        />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <BackgroundFlows />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <TriVisionXLogo size="lg" animate={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-xl border border-border bg-card p-8 shadow-2xl shadow-black/60 w-full flex flex-col items-center space-y-5"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-border bg-background">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-zinc-200">
                Verifying Credentials
              </h2>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Securely authenticating with {provider}...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[500px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(ellipse, rgba(113,113,122,0.4) 0%, rgba(82,82,91,0.15) 50%, transparent 70%)" }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <BackgroundFlows />

      {/* Home button — top left */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      {/* ── Auth Card ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo above card */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <TriVisionXLogo size="lg" animate={false} />
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0C0C0D]/95 backdrop-blur-2xl text-foreground shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 space-y-5"
        >
          {/* CardHeader */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-extrabold leading-none tracking-tight text-foreground">
              Sign in to TriVisionX
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Continue with Google or GitHub to access your workspace.
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 rounded-xl border border-red-800/60 bg-red-950/50 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAuth Buttons (Google & GitHub Only) */}
          <div className="space-y-3 pt-1">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isGitHubLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isGoogleLoading || isGitHubLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isGitHubLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="pt-2 text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  )
}
