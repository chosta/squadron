import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/admin',
  '/profile',
  '/dashboard',
];

/**
 * Public routes - handled by client-side auth
 * Note: We don't redirect authenticated users from /login here because
 * the client needs to check Ethos profile status first (NoEthosProfile screen)
 */
const authRoutes: string[] = [];

/**
 * Check if a path matches any of the given route prefixes
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Get Privy token from cookies
  // Note: Privy stores its token in cookies automatically
  const privyToken = request.cookies.get('privy-token')?.value;
  const isAuthenticated = !!privyToken;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && matchesRoute(pathname, authRoutes)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && matchesRoute(pathname, protectedRoutes)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
