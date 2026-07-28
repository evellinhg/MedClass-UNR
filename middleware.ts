import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_ROUTES = ["/dashboard", "/admin", "/questoes"]
const PUBLIC_ROUTES = ["/login", "/", "/auth"]

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith("/api/"))
  if (isPublicRoute) return NextResponse.next()

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtectedRoute) return NextResponse.next()

  if (hasSupabaseAuthCookie(request)) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
