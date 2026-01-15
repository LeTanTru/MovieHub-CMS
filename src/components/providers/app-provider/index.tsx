'use client';

import envConfig from '@/config';
import {
  ErrorCode,
  KIND_EMPLOYEE,
  KIND_MANAGER,
  socketSendCMDs,
  storageKeys
} from '@/constants';
import { logger } from '@/logger';
import {
  useEmployeeProfileQuery,
  useGetClientTokenMutation,
  useManageProfileQuery
} from '@/queries';
import { useAuthStore, useSocketStore } from '@/store';
import { getData, isTokenExpired, removeData } from '@/utils';
import { type ReactNode, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function AppProvider({ children }: { children: ReactNode }) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const kind = getData(storageKeys.USER_KIND);
  const [clientToken, setClientToken] = useState<string>('');
  const { setLoading, setProfile } = useAuthStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      setLoading: s.setLoading,
      setProfile: s.setProfile
    }))
  );
  const { setSocket } = useSocketStore(
    useShallow((s) => ({ socket: s.socket, setSocket: s.setSocket }))
  );

  const isValidKind =
    kind && (+kind === KIND_MANAGER || +kind === KIND_EMPLOYEE);
  const shouldFetchProfile = !!accessToken && !!isValidKind;

  const managerProfileQuery = useManageProfileQuery(
    shouldFetchProfile && +kind === KIND_MANAGER
  );
  const employeeProfileQuery = useEmployeeProfileQuery(
    shouldFetchProfile && +kind === KIND_EMPLOYEE
  );
  const { mutateAsync: getClientToken } = useGetClientTokenMutation();

  const profileQuery =
    kind && +kind === KIND_MANAGER ? managerProfileQuery : employeeProfileQuery;

  useEffect(() => {
    setLoading(profileQuery.isLoading || profileQuery.isFetching);
  }, [profileQuery.isFetching, profileQuery.isLoading, setLoading]);

  useEffect(() => {
    if (!profileQuery.data) return;

    if (profileQuery.data.result && profileQuery.data.data) {
      setProfile(profileQuery.data.data);
    } else {
      const code = profileQuery.data.code;
      if (code === ErrorCode.EMPLOYEE_ERROR_NOT_FOUND) {
        removeData(storageKeys.ACCESS_TOKEN);
        removeData(storageKeys.REFRESH_TOKEN);
        removeData(storageKeys.USER_KIND);
      }
    }
  }, [profileQuery.data, setProfile]);

  useEffect(() => {
    if (!profileQuery.error) return;
    logger.error('Error while fetching profile', profileQuery.error);
  }, [profileQuery.error]);

  useEffect(() => {
    if (!accessToken || !kind) return;

    if (+kind !== KIND_MANAGER && +kind !== KIND_EMPLOYEE) {
      removeData(storageKeys.ACCESS_TOKEN);
      removeData(storageKeys.REFRESH_TOKEN);
      removeData(storageKeys.USER_KIND);
    }
  }, [accessToken, kind]);

  useEffect(() => {
    if (!accessToken || isTokenExpired(accessToken)) {
      setClientToken('');
      return;
    }

    if (clientToken) return;

    let isMounted = true;

    const handleGetClientToken = async () => {
      try {
        const res = await getClientToken({
          appName: envConfig.NEXT_PUBLIC_APP_NAME
        });
        if (res.data?.token && isMounted) {
          setClientToken(res.data.token);
        }
      } catch (error) {
        logger.error('Error while getting client token', error);
      }
    };

    handleGetClientToken();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clientToken, getClientToken]);

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
  }, [clientToken, setSocket]);

  return <>{children}</>;
}
