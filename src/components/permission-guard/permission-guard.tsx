'use client';

import {
  useAuth,
  useFirstActiveRoute,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { usePathname } from 'next/navigation';
import { getData, removeData, setData, validatePermission } from '@/utils';
import { type ReactNode, useEffect, useMemo } from 'react';
import { Unauthorized } from '@/components/unauthorized';
import { Loader } from 'lucide-react';
import { route } from '@/routes';
import { storageKeys } from '@/constants';
import { useAppContext } from '@/components/providers/app-provider';
import { RouteItem } from '@/types';

type PermissionGuardProps = { children: ReactNode };

// Precompiled flat route map — built once at module load
const routeMatcherCache: Array<{ pattern: RegExp; item: RouteItem }> = [];

const createRouteRegex = (regexString: string) =>
  new RegExp(`^${regexString}$`);

function buildRouteCache(obj: Record<string, any>) {
  for (const key in obj) {
    const item = obj[key];
    if (item?.path) {
      const regexString = item.path
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/:[^/]+/g, '[^/]+')
        .replace(/\//g, '\\/');
      routeMatcherCache.push({
        pattern: createRouteRegex(regexString),
        item
      });
    }
    if (item?.children) {
      buildRouteCache(item.children);
    }
    if (typeof item === 'object' && item !== obj) {
      buildRouteCache(item);
    }
  }
}

buildRouteCache(route);

function findRouteByPath(pathname: string): RouteItem | null {
  for (const { pattern, item } of routeMatcherCache) {
    if (pattern.test(pathname)) return item;
  }
  return null;
}

export default function PermissionGuard({ children }: PermissionGuardProps) {
  const { queryString } = useQueryParams();
  const navigate = useNavigate(false);
  const pathname = usePathname();
  const { permissionCode: userPermissions, isAuthenticated } = useAuth();

  const { loading, setLoading } = useAppContext();

  const firstActiveRoute = useFirstActiveRoute();

  // Memoize matched route — only recomputes when pathname changes
  const matchedRoute = useMemo(() => findRouteByPath(pathname), [pathname]);

  const isPublicRoute = matchedRoute?.auth === false;

  const isSafeInternalPath = (path: unknown): path is string => {
    if (typeof path !== 'string' || !path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;
    if (/^(javascript|data|vbscript):/i.test(path)) return false;
    return true;
  };

  useEffect(() => {
    // non-existent route → show 404
    if (matchedRoute === null) return;

    // loading or public route + not authenticated → show loading or login
    if (loading || (isPublicRoute && !isAuthenticated)) {
      setLoading(false);
      return;
    }

    // Not authenticated → redirect to login with entered path
    if (!isAuthenticated) {
      if (pathname !== route.login.path) {
        if (pathname !== route.home.path) {
          setData(
            storageKeys.PATH_NO_LOGIN,
            queryString ? `${pathname}?${queryString}` : pathname
          );
        }
        navigate.replace(route.login.path);
      }
    } else {
      // Authenticated + on home/login → redirect to first active route
      if (pathname === route.home.path || pathname === route.login.path) {
        const pathNoLogin = getData(storageKeys.PATH_NO_LOGIN);
        let targetPath =
          (isSafeInternalPath(pathNoLogin) && pathNoLogin !== route.home.path
            ? pathNoLogin
            : firstActiveRoute) || route.profile.savePage.path;

        if (targetPath === route.home.path) {
          targetPath = route.profile.savePage.path;
        }

        if (pathname !== targetPath) {
          navigate.replace(targetPath);
          removeData(storageKeys.PATH_NO_LOGIN);
        }
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
    setLoading
  ]);

  // get route permission
  const requiredPermissions = matchedRoute?.permissionCode ?? [];

  // check permission
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

  // check authorization
  if (!hasPermission && isAuthenticated) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
