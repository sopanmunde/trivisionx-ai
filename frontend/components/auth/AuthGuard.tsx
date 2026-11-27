"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

function parseCookieValue(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
}

function isTokenValid(token: string | null): boolean {
  if (!token || token === "demo_guest_token") return false
  const parts = token.split(".")
  if (parts.length !== 3) return false
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return false
    }
    return Boolean(payload.sub)
  } catch {
    return false
  }
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const pathname = window.location.pathname
      const isDemoRoute = pathname === "/demo" || pathname.startsWith("/demo/")
      const lsToken = localStorage.getItem("token")
      const cookieToken = parseCookieValue("auth_token")
      const validToken = isTokenValid(lsToken)
        ? lsToken
        : isTokenValid(cookieToken)
          ? cookieToken
          : null

      if (isDemoRoute) {
        if (!validToken) {
          localStorage.setItem("is_demo", "true")
          localStorage.setItem("token", "demo_guest_token")
          document.cookie = "is_demo=true; path=/; max-age=86400; SameSite=Lax"
        }
        setIsAuthenticated(true)
        return
      }

      if (!validToken) {
        localStorage.removeItem("token")
        localStorage.removeItem("is_demo")
        document.cookie = "auth_token=; path=/; max-age=0"
        document.cookie = "is_demo=; path=/; max-age=0"
        setIsAuthenticated(false)
        router.replace("/login")
        return
      }

      if (lsToken !== validToken) {
        localStorage.setItem("token", validToken)
      }
      localStorage.removeItem("is_demo")
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
      router.replace("/login")
    }
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
