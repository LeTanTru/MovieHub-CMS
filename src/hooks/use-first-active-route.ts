'use client';

import useAuth from '@/hooks/use-auth';
import { getFirstActiveRoute } from '@/utils';

export default function useFirstActiveRoute() {
  const { permissionCode } = useAuth();
  const firstActiveRoute = getFirstActiveRoute(permissionCode);

  return firstActiveRoute;
}
