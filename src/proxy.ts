import { storageKeys } from '@/constants';
import { route } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';

const authPaths = ['/login'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(storageKeys.ACCESS_TOKEN)?.value;
  const userKind = request.cookies.get(storageKeys.USER_KIND)?.value;

  // If session is incomplete, clear all auth cookies and redirect to login
  if ((accessToken && !userKind) || (!accessToken && userKind)) {
    const response = NextResponse.redirect(
      new URL(route.login.path, request.nextUrl)
    );
    response.cookies.delete(storageKeys.ACCESS_TOKEN);
    response.cookies.delete(storageKeys.REFRESH_TOKEN);
    response.cookies.delete(storageKeys.USER_KIND);
    return response;
  }

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
