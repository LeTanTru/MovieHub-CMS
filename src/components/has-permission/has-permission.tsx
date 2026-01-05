'use client';

import { useIsMounted, useValidatePermission } from '@/hooks';

export default function HasPermission({
  children,
  requiredPermissions
}: {
  children: React.ReactNode;
  requiredPermissions: string[];
}) {
  const isMounted = useIsMounted();
  const { hasPermission } = useValidatePermission();

  if (!isMounted) return null;

  return hasPermission({ requiredPermissions }) ? children : null;
}
