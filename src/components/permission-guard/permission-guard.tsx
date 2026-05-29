'use client';

import {
  useAuth,
  useFirstActiveRoute,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { usePathname } from 'next/navigation';
import {
  buildLoginRedirectPath,
  isSafeInternalPath,
  validatePermission
} from '@/utils';
import { type ReactNode, useEffect, useMemo } from 'react';
import { Forbidden } from '@/components/forbidden';
import { Loader } from 'lucide-react';
import { route } from '@/routes';
import { useAppContext } from '@/components/providers/app-provider';
import { RouteItem } from '@/types';

type PermissionGuardProps = { children: ReactNode };

const routeMatcherCache: Array<{ pattern: RegExp; item: RouteItem }> = [];

const createRouteRegex = (regexString: string) =>
  new RegExp(`^${regexString}$`);

function buildRouteCache(obj: Record<string, unknown>) {
  for (const key in obj) {
    const item = obj[key] as Record<string, unknown> | null | undefined;
    if (item && item.path && typeof item.path === 'string') {
      const regexString = item.path
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/:[^/]+/g, '[^/]+')
        .replace(/\//g, '\\/');
      routeMatcherCache.push({
        pattern: createRouteRegex(regexString),
        item: item as unknown as RouteItem
      });
    }
    if (item && item.children && typeof item.children === 'object') {
      buildRouteCache(item.children as Record<string, unknown>);
    }
    if (typeof item === 'object' && item !== null && item !== obj) {
      buildRouteCache(item);
    }
  }
}

buildRouteCache(route as unknown as Record<string, unknown>);

function findRouteByPath(pathname: string): RouteItem | null {
  for (const { pattern, item } of routeMatcherCache) {
    if (pattern.test(pathname)) return item;
  }
  return null;
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const { queryString, searchParams } = useQueryParams<{ redirect?: string }>();
  const navigate = useNavigate(false);
  const pathname = usePathname();
  const { permissionCode: userPermissions, isAuthenticated } = useAuth();

  const { loading, setLoading } = useAppContext();

  const firstActiveRoute = useFirstActiveRoute();
  const matchedRoute = useMemo(() => findRouteByPath(pathname), [pathname]);
  const isPublicRoute = matchedRoute?.auth === false;

  useEffect(() => {
    if (matchedRoute === null) return;

    if (loading || (isPublicRoute && !isAuthenticated)) {
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      if (pathname !== route.login.path) {
        navigate.replace(buildLoginRedirectPath(pathname, queryString));
      }
    } else if (pathname === route.home.path || pathname === route.login.path) {
      const requestedPath = searchParams.redirect;
      let targetPath =
        (isSafeInternalPath(requestedPath) &&
        requestedPath !== route.home.path &&
        requestedPath !== route.login.path
          ? requestedPath
          : firstActiveRoute) || route.profile.savePage.path;

      if (targetPath === route.home.path) {
        targetPath = route.profile.savePage.path;
      }

      if (pathname !== targetPath) {
        navigate.replace(targetPath);
      }
    }
  }, [
    firstActiveRoute,
    isAuthenticated,
    isPublicRoute,
    loading,
    matchedRoute,
    navigate,
    pathname,
    queryString,
    searchParams,
    setLoading
  ]);

  const requiredPermissions = matchedRoute?.permissionCode ?? [];

  const hasPermission =
    requiredPermissions.length === 0 ||
    (!!matchedRoute &&
      validatePermission({
        requiredPermissions,
        path: pathname.split('/')?.pop(),
        userPermissions,
        separate: matchedRoute.separate as boolean,
        excludeKind: matchedRoute.excludeKind as string[],
        requiredKind: matchedRoute.requiredKind as number,
        userKind: matchedRoute.userKind as number
      }));

  if (loading && !isAuthenticated && !isPublicRoute) {
    return (
      <div
        suppressHydrationWarning
        className='fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-white'
      >
        <Loader className='size-8 animate-spin' />
      </div>
    );
  }

  if (!hasPermission && isAuthenticated) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
