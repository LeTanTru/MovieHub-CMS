import { storageKeys } from '@/constants';
import { route } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';
import { getFirstActiveRoute } from '@/utils/menu-config.util';
import { decodeJwt } from '@/utils';

const authPaths = ['/login'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(storageKeys.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(storageKeys.REFRESH_TOKEN)?.value;
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(storageKeys.X_URL, request.url);

  // If logged in, redirect to first route or profile page
  if (accessToken) {
    const isHomePath = pathname === route.home.path;

    if (isAuthPath || isHomePath) {
      const decoded = decodeJwt(accessToken);
      const authorities = decoded?.authorities || [];
      const targetPath =
        getFirstActiveRoute(authorities) || route.profile.savePage.path;
      return NextResponse.redirect(new URL(targetPath, request.nextUrl));
    }
  }
  // If not logged in, save entered path to params
  else if (!refreshToken) {
    // Access private page, redirect to login
    if (!isAuthPath) {
      const loginUrl = new URL(route.login.path, request.nextUrl);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/', '/login']
};
