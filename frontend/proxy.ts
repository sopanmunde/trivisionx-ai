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

  // Generate CSP and nonce for HTML page requests
  const nonce = crypto.randomUUID()
  
  // Construct CSP policy
  // In development, we keep 'unsafe-inline' to support HMR/React Refresh.
  // In production, we use the secure nonce-based approach.
  const isDev = process.env.NODE_ENV === "development"
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' https://vercel.live"
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live`

  const cspHeader = `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.vercel.app https://trivisionx-ai-api.onrender.com https://trivisionx-ai.onrender.com http://localhost:8000 https://vitals.vercel-analytics.com;`

  // Create request headers with nonce so Server Components can read it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set Content-Security-Policy on the response headers
  response.headers.set("Content-Security-Policy", cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all images, svg, icons, logo
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
}
