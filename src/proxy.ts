import { storageKeys } from '@/constants';
import { route } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';

const authPaths = ['/login'];

// const publicPaths = ['/privacy', '/contact'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(storageKeys.ACCESS_TOKEN)?.value;
  // If logged in
  if (accessToken) {
    // Access public page, redirect to home
    if (authPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL(route.home.path, request.nextUrl));
    }
  }
  // If not logged in
  else {
    // Access private page, redirect to login
    if (!authPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL(route.login.path, request.nextUrl));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/', '/login']
};
