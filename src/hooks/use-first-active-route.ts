import { useAuth } from '@/hooks/use-auth';
import { getFirstActiveRoute } from '@/utils';

export const useFirstActiveRoute = () => {
  const { permissionCode } = useAuth();
  const firstActiveRoute = getFirstActiveRoute(permissionCode);

  return firstActiveRoute;
};
