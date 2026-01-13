'use client';

import { useIsMounted, useValidatePermission } from '@/hooks';
import type { ReactNode } from 'react';

export default function HasPermission({
  children,
  requiredPermissions
}: {
  children: ReactNode;
  requiredPermissions: string[];
}) {
  const isMounted = useIsMounted();
  const hasPermission = useValidatePermission();

  if (!isMounted) return null;

  return hasPermission({ requiredPermissions }) ? children : null;
}
