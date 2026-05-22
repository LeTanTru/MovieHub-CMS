import { storageKeys } from '@/constants';
import { route } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';
import { getFirstActiveRoute } from '@/utils/menu-config.util';
import { decodeJwt } from '@/utils';

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
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
    const isHomePath = pathname === route.home.path;

    if (isAuthPath || isHomePath) {
      const decoded = decodeJwt(accessToken);
      const authorities = decoded?.authorities || [];
      const targetPath =
        getFirstActiveRoute(authorities) || route.profile.savePage.path;
      return NextResponse.redirect(new URL(targetPath, request.nextUrl));
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
