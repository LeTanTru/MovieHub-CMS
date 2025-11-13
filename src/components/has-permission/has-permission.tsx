'use client';

import { useIsMounted } from '@/hooks';
import useValidatePermission from '@/hooks/use-validate-permission';

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
