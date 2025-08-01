import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Use a named function instead of an anonymous function
export async function authMiddleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Protected routes
  const protectedPaths = ["/booking-form", "/booking-lookup"]

  const path = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Export the middleware function
export { authMiddleware as middleware }

export const config = {
  matcher: ["/booking-form/:path*", "/booking-lookup/:path*"],
}
