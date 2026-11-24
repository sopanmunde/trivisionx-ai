import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/setting"]
const authRoutes = ["/login", "/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get("auth_token")?.value
  const isDemoQuery = request.nextUrl.searchParams.get("demo") === "true"
  const isDemoCookie = request.cookies.get("is_demo")?.value === "true"
  const isDemo = isDemoQuery || isDemoCookie

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !authToken && !isDemo) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const response = NextResponse.next()

  if (isDemoQuery && !isDemoCookie) {
    response.cookies.set("is_demo", "true", {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setting/:path*",
    "/login",
    "/signup",
  ],
}
