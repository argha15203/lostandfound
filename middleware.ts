import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/dashboard"]
  const protectedPostRoutes = ["/post"] // Exclude /post/create from protection
  const adminRoutes = ["/admin"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedPostRoute = protectedPostRoutes.some((route) => pathname.startsWith(route) && !pathname.startsWith("/post/create"))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || isProtectedPostRoute || isAdminRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      // Check admin access for admin routes
      if (isAdminRoute && !decoded.isAdmin) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/post/:path*", "/dashboard/:path*", "/admin/:path*"],
}
