import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ["/login", "/signup"]
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Redirect if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect if accessing auth routes with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/signup"],
}

