'use client';

import { GROUP_KIND_ADMIN, GROUP_KIND_EMPLOYEE } from '@/constants';
import {
  useEmployeeProfileQuery,
  useProfileQuery,
  useSession
} from '@/queries';
import { useAuthStore } from '@/store';
import { domAnimation, LazyMotion } from 'framer-motion';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
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

export const AppProvider = ({ children }: AppProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const {
    accessToken,
    userKind,
    setAccessToken,
    setCsrfToken,
    setProfile,
    setUserKind
  } = useAuthStore(
    useShallow((s) => ({
      accessToken: s.accessToken,
      userKind: s.userKind,
      setAccessToken: s.setAccessToken,
      setCsrfToken: s.setCsrfToken,
      setProfile: s.setProfile,
      setUserKind: s.setUserKind
    }))
  );

  const { data: session, isLoading: sessionLoading } = useSession();

  const { data: profileData, isLoading: profileLoading } = useProfileQuery(
    !loading &&
      !!accessToken &&
      !!userKind &&
      parseInt(userKind) === GROUP_KIND_ADMIN
  );

  const { data: employeeProfileData, isLoading: employeeProfileLoading } =
    useEmployeeProfileQuery(
      !loading &&
        !!accessToken &&
        !!userKind &&
        parseInt(userKind) === GROUP_KIND_EMPLOYEE
    );

  useEffect(() => {
    if (session) {
      setAccessToken(session.accessToken);
      setCsrfToken(session.csrfToken);
      setUserKind(session.userKind);
    }
  }, [session, setUserKind, setAccessToken, setCsrfToken]);

  const profile = profileData || employeeProfileData;

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  return (
    <AppContext.Provider
      value={{
        loading:
          loading || profileLoading || employeeProfileLoading || sessionLoading,
        setLoading
      }}
    >
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </AppContext.Provider>
  );
};
