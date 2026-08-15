import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleFromToken(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.role || null;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Protect /cart, /user, and /admin routes
  const isProtectedUserRoute = pathname.startsWith('/cart') || pathname.startsWith('/user');
  const isProtectedAdminRoute = pathname.startsWith('/admin');

  if ((isProtectedUserRoute || isProtectedAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedAdminRoute && token) {
    const role = getRoleFromToken(token);
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/user/:path*', '/admin/:path*'],
};
