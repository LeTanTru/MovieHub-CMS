'use client';

import { useIsMounted } from '@/hooks/use-is-mounted';
import { useValidatePermission } from '@/hooks/use-validate-permission';
import type { ReactNode } from 'react';

type HasPermissionProps = {
  children: ReactNode;
  requiredPermissions: string[];
};

export function HasPermission({
  children,
  requiredPermissions
}: HasPermissionProps) {
  const isMounted = useIsMounted();
  const hasPermission = useValidatePermission();

  if (!isMounted) return null;

  return hasPermission({ requiredPermissions }) ? children : null;
}
