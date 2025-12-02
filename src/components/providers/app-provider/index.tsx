'use client';

import envConfig from '@/config';
import {
  KIND_EMPLOYEE,
  KIND_MANAGER,
  socketSendCMDs,
  storageKeys
} from '@/constants';
import {
  useEmployeeProfileQuery,
  useGetClientTokenMutation,
  useManagerProfileQuery,
  useRefreshTokenMutation
} from '@/queries';
import { useAuthStore, useSocketStore } from '@/store';
import {
  getData,
  isTokenExpired,
  isTokenExpiringSoon,
  removeData,
  setData
} from '@/utils';
import { useEffect, useState } from 'react';

export default function AppProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const refreshToken = getData(storageKeys.REFRESH_TOKEN);
  const kind = getData(storageKeys.USER_KIND);
  const [clientToken, setClientToken] = useState<string>('');
  const { isAuthenticated, setLoading, setProfile } = useAuthStore();
  const { socket, setSocket } = useSocketStore();
  const managerProfileQuery = useManagerProfileQuery();
  const employeeProfileQuery = useEmployeeProfileQuery();
  const getClientTokenMutation = useGetClientTokenMutation();
  const refreshTokenMutation = useRefreshTokenMutation();

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

  useEffect(() => {
    if (!accessToken) return;

    const handleGetClientToken = async () => {
      const res = await getClientTokenMutation.mutateAsync({
        appName: envConfig.NEXT_PUBLIC_APP_NAME
      });
      if (res.data?.token) setClientToken(res.data.token);
    };

    handleGetClientToken();
  }, [accessToken]);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      const payload = {
        cmd: 'CLIENT_VERIFY_TOKEN',
        platform: 0,
        clientVersion: '1.0',
        lang: 'vi',
        token: clientToken,
        app: 'CLIENT_APP',
        data: { app: 'CLIENT_APP' }
      };

      if (clientToken) socket.send(JSON.stringify(payload));
    };
  }, [clientToken]);

  useEffect(() => {
    if (!clientToken) return;

    const socket = new WebSocket(envConfig.NEXT_PUBLIC_API_SOCKET);
    setSocket(socket);

    let pingInterval: NodeJS.Timeout | null = null;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          cmd: socketSendCMDs.CMD_CLIENT_VERIFY_TOKEN,
          platform: 0,
          clientVersion: '1.0',
          lang: 'vi',
          token: clientToken,
          app: 'CLIENT_APP',
          data: { app: 'CLIENT_APP' }
        })
      );

      pingInterval = setInterval(() => {
        socket.send(
          JSON.stringify({
            cmd: socketSendCMDs.CMD_CLIENT_PING,
            platform: 0,
            clientVersion: '1.0',
            lang: 'vi',
            token: clientToken,
            app: 'CLIENT_APP',
            data: { app: 'CLIENT_APP' }
          })
        );
      }, 30 * 1000);
    };

    socket.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
    };

    // socket.onmessage = logger.info;

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      socket.close();
    };
  }, [clientToken]);

  useEffect(() => {
    if (!refreshToken) return;

    const handleRefreshToken = async () => {
      const res = await refreshTokenMutation.mutateAsync({
        refresh_token: refreshToken,
        grant_type: envConfig.NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN
      });

      if (res?.access_token) {
        setData(storageKeys.ACCESS_TOKEN, res?.access_token);
      }

      if (res?.refresh_token) {
        setData(storageKeys.REFRESH_TOKEN, res?.refresh_token);
      }
    };

    const interval = setInterval(() => {
      if (isTokenExpired(accessToken)) {
        handleRefreshToken();
      }
    });

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
