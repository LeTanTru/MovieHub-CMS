'use client';

import useAuth from '@/hooks/use-auth';
import { validatePermission } from '@/utils';

const useValidatePermission = () => {
  const { permissionCode } = useAuth();
  const hasPermission = ({
    requiredPermissions = [],
    requiredKind,
    excludeKind,
    userKind,
    path,
    separate
  }: {
    requiredPermissions: string[];
    requiredKind?: number;
    excludeKind?: string[];
    userKind?: number;
    path?: string;
    separate?: boolean;
  }) => {
    return validatePermission({
      requiredPermissions,
      userPermissions: permissionCode,
      requiredKind,
      excludeKind,
      userKind,
      path,
      separate
    });
  };
  return { hasPermission };
};

export default useValidatePermission;
