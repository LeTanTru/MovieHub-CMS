import { useAuthStore } from '@/store';
import { decodeJwt } from '@/utils';
import { useShallow } from 'zustand/react/shallow';

export const useAuth = () => {
  const { accessToken, userKind, profile } = useAuthStore(
    useShallow((s) => ({
      accessToken: s.accessToken,
      userKind: s.userKind,
      profile: s.profile
    }))
  );

  let permissionCode: string[] = [];
  if (accessToken) {
    const decodedToken = decodeJwt(accessToken);
    if (decodedToken?.authorities) {
      permissionCode =
        decodedToken?.authorities?.length > 0
          ? decodedToken?.authorities?.map((role) => role)
          : [];
    }
  }

  return {
    isAuthenticated: Boolean(accessToken && userKind && profile),
    profile,
    kind: profile?.kind,
    permissionCode: permissionCode.map((pCode) => pCode)
  };
};
