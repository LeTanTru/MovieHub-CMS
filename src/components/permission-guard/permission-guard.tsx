'use client';

import { useAuth, useFirstActiveRoute, useQueryParams } from '@/hooks';
import { usePathname, useRouter } from 'next/navigation';
import {
  getAccessTokenFromLocalStorage,
  getData,
  removeData,
  setData,
  validatePermission
} from '@/utils';
import { useEffect, useState } from 'react';
import { Unauthorized } from '@/components/unauthorized';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useAuthStore } from '@/store';
import { route } from '@/routes';
import { storageKeys } from '@/constants';
import { RouteItem } from '@/routes/route';

export default function PermissionGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    loading,
    permissionCode: userPermissions,
    isAuthenticated
  } = useAuth();
  const { isLoggedOut, setLoading } = useAuthStore();

  // const navigate = useNavigate(false);
  const router = useRouter();
  const accessToken = getAccessTokenFromLocalStorage();
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const { queryString } = useQueryParams();
  const firstActiveRoute = useFirstActiveRoute();

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

  const matchedRoute: RouteItem = findRouteByPath(route, pathname);
  const isPublicRoute = matchedRoute?.auth === false;

  // ready if loading is false
  useEffect(() => {
    if (!loading) {
      setReady(true);
    }
  }, [loading]);

  // navigate to login if not login
  useEffect(() => {
    if (isPublicRoute && !isAuthenticated) return;

    if (!accessToken && !isAuthenticated && !isLoggedOut) {
      if (pathname !== route.login.path) {
        if (pathname !== route.home.path) {
          setData(
            storageKeys.PATH_NO_LOGIN,
            queryString ? `${pathname}?${queryString}` : pathname
          );
        }
        router.replace(route.login.path);
      }
      return;
    }

    if (isAuthenticated) {
      if (pathname === route.home.path || pathname === route.login.path) {
        if (pathname !== firstActiveRoute) {
          router.replace(
            getData(storageKeys.PATH_NO_LOGIN) ||
              firstActiveRoute ||
              route.profile.savePage.path
          );
          removeData(storageKeys.PATH_NO_LOGIN);
        }
      }
    }
  }, [
    accessToken,
    isAuthenticated,
    pathname,
    router,
    firstActiveRoute,
    isLoggedOut,
    isPublicRoute,
    queryString
  ]);

  // if logged in, set loading to false
  useEffect(() => {
    if (isAuthenticated) setLoading(false);
  }, [isAuthenticated, setLoading]);

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

  // show overlay
  const showOverlay =
    (!isAuthenticated && pathname !== route.login.path) ||
    !ready ||
    loading ||
    (isAuthenticated && pathname === route.login.path) ||
    (isAuthenticated && pathname === route.home.path);

  // check authorization
  if (!hasPermission && isAuthenticated && ready) {
    return <Unauthorized />;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.div
        key='content'
        initial={{ opacity: 0 }}
        animate={{ opacity: showOverlay ? 0 : 1 }}
      >
        {children}
      </motion.div>

      <motion.div
        key='loading'
        initial={{ opacity: 0 }}
        animate={{
          opacity: showOverlay ? 1 : 0,
          zIndex: showOverlay ? 9999 : -9999,
          display: showOverlay ? 'flex' : 'none'
        }}
        className='fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-white'
      >
        <Loader className='size-8 animate-spin' />
      </motion.div>
    </>
  );
}
