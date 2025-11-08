'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout';
import { GroupList } from '@/app/group-permission/_components';
import PermissionList from '@/app/group-permission/_components/permission-list';
import GroupPermissionList from '@/app/group-permission/_components/group-permission-list';
import { useState } from 'react';
import { getData, setData } from '@/utils';
import { queryKeys, storageKeys } from '@/constants';
import { useIsMounted } from '@/hooks';

export default function GroupPermissionPage() {
  const [activeTab, setActiveTab] = useState(
    getData(storageKeys.ACTIVE_GROUP_TAB) || 'group-list'
  );
  const isMounted = useIsMounted();

  const tabs = [
    {
      value: 'group-list',
      label: 'Vai trò',
      component: <GroupList queryKey={queryKeys.GROUP} />
    },
    {
      value: 'group-permission-list',
      label: 'Nhóm quyền',
      component: <GroupPermissionList queryKey={queryKeys.GROUP_PERMISSION} />
    },
    { value: 'permission', label: 'Quyền', component: <PermissionList /> }
  ];

  if (!isMounted) return null;

  return (
    <PageWrapper breadcrumbs={[{ label: 'Quyền' }]}>
      <div className='rounded-lg bg-white'>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className='relative h-auto w-full justify-start gap-0.5 bg-transparent p-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-zinc-100'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => setData(storageKeys.ACTIVE_GROUP_TAB, tab.value)}
                className='data-[state=active]:text-dodger-blue cursor-pointer overflow-hidden rounded-b-none border-x border-t bg-zinc-50 py-2 font-normal text-black focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:z-10 data-[state=active]:shadow-none'
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
