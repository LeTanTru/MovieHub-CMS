'use client';

import { KIND_EMPLOYEE, KIND_MANAGER, storageKeys } from '@/constants';
import { useEmployeeProfileQuery, useManagerProfileQuery } from '@/queries';
import { useAuthStore } from '@/store';
import { getData, removeData } from '@/utils';
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

    if (!kind) return;

    if (+kind !== KIND_MANAGER && +kind !== KIND_EMPLOYEE) {
      removeData(storageKeys.ACCESS_TOKEN);
      removeData(storageKeys.REFRESH_TOKEN);
      removeData(storageKeys.USER_KIND);
      return;
    }

    const handleGetProfile = async () => {
      const res = await profileQuery.refetch();
      if (res.data?.result && res.data.data) {
        setProfile(res.data.data);
      }
    };

    handleGetProfile();
  }, [accessToken, isAuthenticated, kind]);

  return <>{children}</>;
}
