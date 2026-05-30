import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

// Routes only accessible to unauthenticated users
const authRoutes = ["/login", "/signup"]

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth token in cookies (set on login)
  const token = request.cookies.get("auth_token")?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If trying to access a protected route without a token → redirect to /login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already logged in and trying to access login/signup → redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
