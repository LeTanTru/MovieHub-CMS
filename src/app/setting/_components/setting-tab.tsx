'use client';

import { PageWrapper } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  storageKeys,
  TAB_SETTING_GENERAL,
  TAB_SETTING_LIVE_ROOM
} from '@/constants';
import { useIsMounted } from '@/hooks';
import { getData, setData } from '@/utils';
import { useState } from 'react';
import { SettingList } from './setting-list';

export function SettingTab() {
  const defaultTab =
    getData(storageKeys.ACTIVE_SETTING_TAB) || TAB_SETTING_GENERAL;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const isMounted = useIsMounted();

  const tabs = [
    {
      value: TAB_SETTING_GENERAL,
      label: 'Cài đặt chung',
      component: <SettingList groupName={TAB_SETTING_GENERAL} />
    },
    {
      value: TAB_SETTING_LIVE_ROOM,
      label: 'Xem chung',
      component: <SettingList groupName={TAB_SETTING_LIVE_ROOM} />
    }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setData(storageKeys.ACTIVE_SETTING_TAB, tab);
  };

  if (!isMounted) return null;

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: tabs.find((tab) => tab.value === activeTab)?.label || ''
        }
      ]}
    >
      <div className='rounded-lg bg-white'>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className='relative h-auto w-full justify-start gap-0.5 bg-transparent p-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-zinc-100'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='data-[state=active]:text-sporty-blue cursor-pointer overflow-hidden rounded-b-none border-x border-t bg-zinc-50 py-2 font-normal text-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:z-10 data-[state=active]:shadow-none'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} className='mt-0' value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageWrapper>
  );
}
