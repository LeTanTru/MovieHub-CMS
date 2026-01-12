'use client';

import { useEffect } from 'react';
import { useSocketStore } from '@/store';
import { logger } from '@/logger';

const useSocketEvent = (
  cmd: string,
  subCmd: string,
  callback: (data: any) => void
) => {
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data: { cmd: string; data: { message: string }; app: string } =
          JSON.parse(event.data);
        if (data.cmd === cmd) {
          if (data.data.message) {
            const message: { cmd: string } = JSON.parse(data.data.message);
            if (message.cmd === subCmd) callback(data.data);
          }
        }
      } catch (err: any) {
        logger.error('Error while handle message:', err);
        logger.info('Invalid socket message:', event.data);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, cmd, callback, subCmd]);
};

export default useSocketEvent;
