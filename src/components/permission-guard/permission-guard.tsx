'use client';

import {
  useAuth,
  useFirstActiveRoute,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { usePathname } from 'next/navigation';
import { getData, removeData, setData, validatePermission } from '@/utils';
import { type ReactNode, useEffect } from 'react';
import { Unauthorized } from '@/components/unauthorized';
import { AnimatePresence, m } from 'framer-motion';
import { Loader } from 'lucide-react';
import { route } from '@/routes';
import { storageKeys } from '@/constants';
import type { RouteItem } from '@/routes/route';
import { useAppContext } from '@/components/providers/app-provider';

type PermissionGuardProps = { children: ReactNode };

export default function PermissionGuard({ children }: PermissionGuardProps) {
  const { queryString } = useQueryParams();
  const navigate = useNavigate(false);
  const pathname = usePathname();
  const { permissionCode: userPermissions, isAuthenticated } = useAuth();

  const { loading, setLoading } = useAppContext();

  const firstActiveRoute = useFirstActiveRoute();
  const matchedRoute: RouteItem = findRouteByPath(route, pathname);
  const isPublicRoute = matchedRoute?.auth === false;

  useEffect(() => {
    if (loading || (isPublicRoute && !isAuthenticated)) {
      setLoading(false);
      return;
    }

    // Not authenticated -> redirect to login with entered path
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
      // Login & go to home or login
      // -> redirect to first active route (or entered path)
      if (pathname === route.home.path || pathname === route.login.path) {
        const pathNoLogin = getData(storageKeys.PATH_NO_LOGIN);
        let targetPath =
          (pathNoLogin && pathNoLogin !== route.home.path
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
    validatePermission({
      requiredPermissions,
      path: pathname.split('/')?.pop(),
      userPermissions,
      separate: matchedRoute.separate as boolean,
      excludeKind: matchedRoute.excludeKind as string[],
      requiredKind: matchedRoute.requiredKind as number,
      userKind: matchedRoute.userKind as number
    });

  if (loading && !isAuthenticated && !isPublicRoute) {
    return (
      <AnimatePresence>
        <m.div
          key='loading'
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            zIndex: 9999,
            display: 'flex'
          }}
          exit={{
            opacity: 0,
            zIndex: -9999
          }}
          className='fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-white'
        >
          <Loader className='size-8 animate-spin' />
        </m.div>
      </AnimatePresence>
    );
  }

  // check authorization
  if (!hasPermission && isAuthenticated) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

function pathToRegex(path: string): RegExp {
  const regexString = path.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');
  return new RegExp(`^${regexString}$`);
}

// find current path in route
function findRouteByPath(obj: Record<string, any>, pathname: string): any {
  for (const key in obj) {
    const item = obj[key];
    if (item?.path) {
      const regex = pathToRegex(item.path);
      if (regex.test(pathname)) return item;
    }
    if (item?.children) {
      const result = findRouteByPath(item.children, pathname);
      if (result) return result;
    }
    if (typeof item === 'object') {
      const result = findRouteByPath(item, pathname);
      if (result) return result;
    }
  }
  return null;
}
