import { useAuthStore } from '@/store';
import { decodeJwt } from '@/utils';
import { useShallow } from 'zustand/react/shallow';

const useAuth = () => {
  const { accessToken, profile } = useAuthStore(
    useShallow((s) => ({
      accessToken: s.accessToken,
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
    isAuthenticated: !!profile,
    profile,
    kind: profile?.kind,
    permissionCode: permissionCode.map((pCode) => pCode)
  };
};

export default useAuth;
