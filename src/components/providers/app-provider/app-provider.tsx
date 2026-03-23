'use client';

import envConfig from '@/config';
import { socketSendCMDs, storageKeys, WEB_PLATFORM } from '@/constants';
import { logger } from '@/logger';
import { useProfileQuery } from '@/queries';
import { useAppLoadingStore, useAuthStore, useSocketStore } from '@/store';
import { getData } from '@/utils';
import { domAnimation, LazyMotion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

export default function AppProvider({ children }: { children: ReactNode }) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const setLoading = useAppLoadingStore((s) => s.setLoading);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setSocket = useSocketStore((s) => s.setSocket);

  const { data: profileData, isLoading: profileLoading } =
    useProfileQuery(!!accessToken);
  const profile = profileData?.data;

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  useEffect(() => {
    setLoading(profileLoading);
  }, [profileLoading, setLoading]);

  /*
  useEffect(() => {
    if (!accessToken) return;

    const socket = new WebSocket(envConfig.NEXT_PUBLIC_API_SOCKET_URL);
    setSocket(socket);

    let pingInterval: NodeJS.Timeout | null = null;

    socket.onopen = () => {
      if (socket.readyState === WebSocket.OPEN) {
        logger.info('Socket connected');
        socket.send(
          JSON.stringify({
            cmd: socketSendCMDs.CMD_CLIENT_VERIFY_TOKEN,
            platform: WEB_PLATFORM,
            clientVersion: '1.0',
            lang: 'vi',
            token: accessToken,
            app: 'CLIENT_APP',
            data: { app: 'CLIENT_APP' }
          })
        );

        pingInterval = setInterval(() => {
          socket.send(
            JSON.stringify({
              cmd: socketSendCMDs.CMD_CLIENT_PING,
              platform: WEB_PLATFORM,
              clientVersion: '1.0',
              lang: 'vi',
              token: accessToken,
              app: 'CLIENT_APP',
              data: { app: 'CLIENT_APP' }
            })
          );
        }, 30 * 1000);
      }
    };

    socket.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
    };

    // socket.onmessage = logger.info;

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      socket.close();
    };
  }, [accessToken, setSocket]);
  */

  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
