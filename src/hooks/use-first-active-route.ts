'use client';

import useAuth from '@/hooks/use-auth';
import { getFirstActiveRoute } from '@/utils';

const useFirstActiveRoute = () => {
  const { permissionCode } = useAuth();
  const firstActiveRoute = getFirstActiveRoute(permissionCode);

  return firstActiveRoute;
};

export default useFirstActiveRoute;
