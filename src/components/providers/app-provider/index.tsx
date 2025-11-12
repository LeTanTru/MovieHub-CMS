'use client';

import { storageKeys } from '@/constants';
import { useProfileQuery } from '@/queries';
import { useAuthStore } from '@/store';
import { getData } from '@/utils';
import { useEffect } from 'react';

export default function AppProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const profileQuery = useProfileQuery();
  const { setProfile, isAuthenticated, setLoading } = useAuthStore();

  useEffect(
    () => setLoading(profileQuery.isLoading || profileQuery.isFetching),
    [profileQuery.isFetching, profileQuery.isLoading, setLoading]
  );

  useEffect(() => {
    if (!accessToken) return;

    const handleGetProfile = async () => {
      const res = await profileQuery.refetch();
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    };

    handleGetProfile();
  }, [accessToken, isAuthenticated]);

  return <>{children}</>;
}
