'use client';

import PersonList from '@/app/person/_components/person-list';
import { PageWrapper } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PERSON_KIND_ACTOR,
  PERSON_KIND_DIRECTOR,
  queryKeys,
  storageKeys
} from '@/constants';
import { useIsMounted } from '@/hooks';
import { getData, setData } from '@/utils';
import { useState } from 'react';

export default function PersonTab() {
  const [activeTab, setActiveTab] = useState(
    getData(storageKeys.ACTIVE_TAB_PERSON_KIND) || 'actor-tab'
  );
  const isMounted = useIsMounted();

  const tabs = [
    {
      value: 'actor-tab',
      label: 'Diễn viên',
      component: (
        <PersonList queryKey={queryKeys.PERSON} kind={PERSON_KIND_ACTOR} />
      )
    },
    {
      value: 'director-tab',
      label: 'Đạo diễn',
      component: (
        <PersonList queryKey={queryKeys.PERSON} kind={PERSON_KIND_DIRECTOR} />
      )
    }
  ];

  if (!isMounted) return null;

  return (
    <PageWrapper
      breadcrumbs={[
        { label: activeTab === 'actor-tab' ? 'Diễn viên' : 'Đạo diễn' }
      ]}
    >
      <div className='rounded-lg bg-white'>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className='relative h-auto w-full justify-start gap-0.5 bg-transparent p-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-zinc-100'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() =>
                  setData(storageKeys.ACTIVE_TAB_PERSON_KIND, tab.value)
                }
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
