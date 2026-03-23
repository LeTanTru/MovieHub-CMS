'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout';
import {
  GroupList,
  GroupPermissionList,
  PermissionList
} from '@/app/group-permission/_components';
import { useState } from 'react';
import { getData, setData } from '@/utils';
import {
  queryKeys,
  storageKeys,
  TAB_GROUP,
  TAB_GROUP_PERMISSION,
  TAB_PERMISSION
} from '@/constants';
import { useIsMounted, useQueryParams } from '@/hooks';

export default function GroupTab() {
  const [activeTab, setActiveTab] = useState(
    getData(storageKeys.ACTIVE_GROUP_TAB) || TAB_GROUP
  );
  const { setQueryParams } = useQueryParams();
  const isMounted = useIsMounted();

  const tabs = [
    {
      value: TAB_GROUP,
      label: 'Vai trò',
      component: <GroupList queryKey={queryKeys.GROUP} />
    },
    {
      value: TAB_GROUP_PERMISSION,
      label: 'Nhóm quyền',
      component: <GroupPermissionList queryKey={queryKeys.GROUP_PERMISSION} />
    },
    { value: TAB_PERMISSION, label: 'Quyền', component: <PermissionList /> }
  ];

  const groupMaps: Record<string, string> = {
    [TAB_GROUP]: 'Vai trò',
    [TAB_GROUP_PERMISSION]: 'Nhóm quyền',
    [TAB_PERMISSION]: 'Quyền'
  };

  const handleTabChange = (activeTab: string) => {
    setQueryParams({});
    setActiveTab(activeTab);
  };

  if (!isMounted) return null;

  return (
    <PageWrapper breadcrumbs={[{ label: groupMaps[activeTab] }]}>
      <div className='rounded-lg bg-white'>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className='relative h-auto w-full justify-start gap-0.5 bg-transparent p-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-zinc-100'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => setData(storageKeys.ACTIVE_GROUP_TAB, tab.value)}
                className='data-[state=active]:text-main-color cursor-pointer overflow-hidden rounded-b-none border-x border-t bg-zinc-50 py-2 font-normal text-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:z-10 data-[state=active]:shadow-none'
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
