import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/shared/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  // Extract tenant slug from hostname
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Extract subdomain (e.g., "tenant1" from "tenant1.localhost:3000")
  const parts = hostname.split('.')
  let tenantSlug = 'default'

  // If we have a subdomain (not just localhost or domain.com)
  if (parts.length > 1 && !hostname.includes('localhost')) {
    tenantSlug = parts[0]
  }

  // For development with localhost, try to get tenant from path or default
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // You can customize this logic for local development
    // For now, we'll use a default tenant
    tenantSlug = 'demo'
  }

  // Create response with tenant info in headers
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Set tenant slug in cookie for client-side access
  response.cookies.set('tenant-slug', tenantSlug, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })

  // Protected routes
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.some(route =>
    url.pathname === route || url.pathname.startsWith(route + '/')
  )

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated and trying to access login/register
  if (user && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
