'use client';

import { useAuthStore } from '@/store';
import { decodeJwt, getAccessTokenFromLocalStorage } from '@/utils';
import { useShallow } from 'zustand/react/shallow';

const useAuth = () => {
  const { profile, loading, isAuthenticated } = useAuthStore(
    useShallow((s) => ({
      profile: s.profile,
      loading: s.loading,
      isAuthenticated: s.isAuthenticated
    }))
  );
  const accessToken = getAccessTokenFromLocalStorage();
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
    isAuthenticated: isAuthenticated || !!profile,
    profile,
    kind: profile?.kind,
    permissionCode: permissionCode.map((pCode) => pCode),
    loading
  };
};

export default useAuth;
