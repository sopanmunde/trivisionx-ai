"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      const cookieAuth = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))

      const isDemo =
        localStorage.getItem("is_demo") === "true" ||
        document.cookie.includes("is_demo=true") ||
        (typeof window !== "undefined" &&
          (window.location.search.includes("demo=true") ||
           window.location.pathname.startsWith("/demo")))

      if (!token && !cookieAuth && !isDemo) {
        setIsAuthenticated(false)
        router.replace("/login")
      } else {
        if (isDemo && !token) {
          localStorage.setItem("is_demo", "true")
          localStorage.setItem("token", "demo_guest_token")
          document.cookie = "is_demo=true; path=/; max-age=86400"
        }
        setIsAuthenticated(true)
      }
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
