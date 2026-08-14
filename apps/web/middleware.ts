import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/user/:path*', '/admin/:path*'],
};
