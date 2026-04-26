'use client';

import { GROUP_KIND_ADMIN, GROUP_KIND_EMPLOYEE, mqttTopics } from '@/constants';
import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
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

export default function AppProvider({ children }: AppProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const { accessToken, userKind, setAccessToken, setUserKind, setProfile } =
    useAuthStore(
      useShallow((s) => ({
        accessToken: s.accessToken,
        userKind: s.userKind,
        setAccessToken: s.setAccessToken,
        setUserKind: s.setUserKind,
        setProfile: s.setProfile
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
    if (session?.result && session?.data) {
      setAccessToken(session.data.accessToken);
      setUserKind(session.data.userKind);
    }
  }, [session, setAccessToken, setUserKind]);

  const profile = profileData?.data || employeeProfileData?.data;

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  const client = getMqttClient();

  useEffect(() => {
    client.subscribe(mqttTopics.NOTIFICATION_CMS, (err) => {
      if (!err)
        logger.info(`Subscribed to MQTT topic: ${mqttTopics.NOTIFICATION_CMS}`);
      else
        logger.error(
          `Failed to subscribe to MQTT topic: ${mqttTopics.NOTIFICATION_CMS}`,
          err
        );
    });

    return () => {
      client.unsubscribe(mqttTopics.NOTIFICATION_CMS);
    };
  }, [client]);

  useEffect(() => {
    if (profile?.id) {
      client.subscribe(
        mqttTopics.NOTIFICATION_ACCOUNT.replace(':accountId', profile.id),
        (err) => {
          if (!err)
            logger.info(
              `Subscribed to MQTT topic: ${mqttTopics.NOTIFICATION_ACCOUNT.replace(
                ':accountId',
                profile.id
              )}`
            );
          else
            logger.error(
              `Failed to subscribe to MQTT topic: ${mqttTopics.NOTIFICATION_ACCOUNT.replace(
                ':accountId',
                profile.id
              )}`,
              err
            );
        }
      );
    }

    return () => {
      if (profile?.id) {
        client.unsubscribe(
          mqttTopics.NOTIFICATION_ACCOUNT.replace(':accountId', profile.id)
        );
      }
    };
  }, [profile?.id, client]);

  useEffect(() => {
    const onMessage = (topic: string, message: Buffer) => {
      logger.info(
        `Received MQTT message on topic: ${topic}`,
        message.toString()
      );
    };

    client.on('message', onMessage);

    return () => {
      client.off('message', onMessage);
    };
  }, [client]);

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
}
