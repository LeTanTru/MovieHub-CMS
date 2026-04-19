'use client';

import {
  GROUP_KIND_ADMIN,
  GROUP_KIND_EMPLOYEE,
  mqttTopics,
  storageKeys
} from '@/constants';
import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { useEmployeeProfileQuery, useProfileQuery } from '@/queries';
import { useAppLoadingStore, useAuthStore } from '@/store';
import { getData } from '@/utils';
import { domAnimation, LazyMotion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

type AppProviderProps = { children: ReactNode };

export default function AppProvider({ children }: AppProviderProps) {
  const accessToken = getData(storageKeys.ACCESS_TOKEN);
  const setLoading = useAppLoadingStore((s) => s.setLoading);
  const setProfile = useAuthStore((s) => s.setProfile);
  const userKind = getData(storageKeys.USER_KIND);

  const { data: profileData, isLoading: profileLoading } = useProfileQuery(
    !!accessToken && !!userKind && parseInt(userKind) === GROUP_KIND_ADMIN
  );

  const { data: employeeProfileData, isLoading: employeeProfileLoading } =
    useEmployeeProfileQuery(
      !!accessToken && !!userKind && parseInt(userKind) === GROUP_KIND_EMPLOYEE
    );

  const profile = profileData?.data || employeeProfileData?.data;

  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  useEffect(() => {
    setLoading(profileLoading || employeeProfileLoading);
  }, [profileLoading, employeeProfileLoading, setLoading]);

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

  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
