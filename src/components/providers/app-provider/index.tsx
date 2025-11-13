'use client';

import { KIND_MANAGER, storageKeys } from '@/constants';
import { useEmployeeProfileQuery, useManagerProfileQuery } from '@/queries';
import { useAuthStore } from '@/store';
import { getData } from '@/utils';
import { useEffect } from 'react';

export default function AppProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const managerProfileQuery = useManagerProfileQuery();
  const employeeProfileQuery = useEmployeeProfileQuery();
  const { isAuthenticated, setLoading, setProfile } = useAuthStore();
  const kind = getData(storageKeys.USER_KIND);

  const profileQuery =
    kind && +kind === KIND_MANAGER ? managerProfileQuery : employeeProfileQuery;

  useEffect(
    () => setLoading(profileQuery.isLoading || profileQuery.isFetching),
    [profileQuery.isFetching, profileQuery.isLoading, setLoading]
  );

  useEffect(() => {
    if (!accessToken) return;

    const handleGetProfile = async () => {
      const res = await profileQuery.refetch();
      if (res.data?.result && res.data.data) {
        setProfile(res.data.data);
      }
    };

    handleGetProfile();
  }, [accessToken, isAuthenticated]);

  return <>{children}</>;
}
