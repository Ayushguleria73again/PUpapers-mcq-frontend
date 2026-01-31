import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/admin', '/profile'];

    // Paths that should NOT be accessible if logged in
    const authPaths = ['/login', '/signup'];

    // If trying to access a protected path without a token
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (!token && isProtected) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && authPaths.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|auth-bg.png).*)',
    ],
};
