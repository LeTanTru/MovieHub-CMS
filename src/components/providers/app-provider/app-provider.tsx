'use client';

import { GROUP_KIND_ADMIN, GROUP_KIND_EMPLOYEE } from '@/constants';
import {
  useEmployeeProfileQuery,
  useProfileQuery,
  useSession
} from '@/queries';
import { useAuthStore } from '@/store';
import { domAnimation, LazyMotion } from 'framer-motion';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks';
import { useShallow } from 'zustand/react/shallow';

type AppContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const AppContext = createContext<AppContextType>({
  loading: false,
  setLoading: () => {}
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

type AppProviderProps = { children: ReactNode };

export function AppProvider({ children }: AppProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const {
    accessToken,
    profile: storedProfile,
    userKind,
    setAccessToken,
    setCsrfToken,
    setProfile,
    setUserKind
  } = useAuthStore(
    useShallow((s) => ({
      accessToken: s.accessToken,
      profile: s.profile,
      userKind: s.userKind,
      setAccessToken: s.setAccessToken,
      setCsrfToken: s.setCsrfToken,
      setProfile: s.setProfile,
      setUserKind: s.setUserKind
    }))
  );

  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: profileData, isLoading: profileLoading } = useProfileQuery(
    !loading && !!accessToken && !!userKind && userKind === GROUP_KIND_ADMIN
  );

  const { data: employeeProfileData, isLoading: employeeProfileLoading } =
    useEmployeeProfileQuery(
      !loading &&
        !!accessToken &&
        !!userKind &&
        userKind === GROUP_KIND_EMPLOYEE
    );

  useIsomorphicLayoutEffect(() => {
    if (session) {
      setAccessToken(session.accessToken);
      setCsrfToken(session.csrfToken);
      setUserKind(session.userKind);

      if (!session.accessToken || !session.userKind) {
        setProfile(null);
      }
    }
  }, [session, setUserKind, setAccessToken, setCsrfToken, setProfile]);

  const profile = profileData || employeeProfileData;

  useIsomorphicLayoutEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  const isSessionHydrating = Boolean(
    session?.accessToken && session?.userKind && (!accessToken || !userKind)
  );
  const isProfileHydrating = Boolean(profile && !storedProfile);

  return (
    <AppContext.Provider
      value={{
        loading:
          loading ||
          sessionLoading ||
          isSessionHydrating ||
          profileLoading ||
          employeeProfileLoading ||
          isProfileHydrating,
        setLoading
      }}
    >
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </AppContext.Provider>
  );
}
