'use client';

import { MoviePersonList } from './movie-person-list';
import { PageWrapper } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PERSON_KIND_ACTOR,
  PERSON_KIND_DIRECTOR,
  storageKeys,
  TAB_MOVIE_PERSON_KIND_ACTOR,
  TAB_MOVIE_PERSON_KIND_DIRECTOR
} from '@/constants';
import { useIsMounted, useQueryParams } from '@/hooks';
import { route } from '@/routes';
import { getData, setData, renderListPageUrl } from '@/utils';
import { useEffect, useState } from 'react';

export function PersonTab() {
  const defaultTab =
    getData(storageKeys.ACTIVE_TAB_MOVIE_PERSON_KIND) ||
    TAB_MOVIE_PERSON_KIND_ACTOR;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isMounted = useIsMounted();

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { movieTitle, parentPage, ...restSearchParams } = parentParams;

  const tabs = [
    {
      value: TAB_MOVIE_PERSON_KIND_ACTOR,
      label: 'Diễn viên',
      component: <MoviePersonList kind={PERSON_KIND_ACTOR} />
    },
    {
      value: TAB_MOVIE_PERSON_KIND_DIRECTOR,
      label: 'Đạo diễn',
      component: <MoviePersonList kind={PERSON_KIND_DIRECTOR} />
    }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setData(storageKeys.ACTIVE_TAB_MOVIE_PERSON_KIND, tab);
  };

  useEffect(() => {
    if (!getData(storageKeys.ACTIVE_TAB_MOVIE_PERSON_KIND)) {
      setData(
        storageKeys.ACTIVE_TAB_MOVIE_PERSON_KIND,
        TAB_MOVIE_PERSON_KIND_ACTOR
      );
    }
  }, []);

  if (!isMounted) return null;

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim',
          href: renderListPageUrl(
            route.movie.getList.path,
            serializeParams({ ...restSearchParams, page: parentPage })
          )
        },
        {
          label: (movieTitle as string) ?? 'Chi tiết'
        },
        {
          label:
            activeTab === TAB_MOVIE_PERSON_KIND_ACTOR ? 'Diễn viên' : 'Đạo diễn'
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
