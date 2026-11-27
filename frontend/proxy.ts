import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/setting"]
const authRoutes = ["/login", "/signup"]

function isValidJwtCookie(token: string | undefined): boolean {
  if (!token || token === "demo_guest_token") return false
  const parts = token.split(".")
  if (parts.length !== 3) return false
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const payload = JSON.parse(jsonPayload)
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return false
    }
    return Boolean(payload.sub)
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get("auth_token")?.value
  const hasValidSession = isValidJwtCookie(authToken)

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete("auth_token")
    res.cookies.delete("is_demo")
    return res
  }

  if (isAuthRoute && hasValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const response = NextResponse.next()

  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    response.cookies.set("is_demo", "true", {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setting/:path*",
    "/demo/:path*",
    "/login",
    "/signup",
  ],
}
