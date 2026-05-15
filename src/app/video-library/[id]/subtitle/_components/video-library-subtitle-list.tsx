'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { apiConfig, objectNames, queryKeys } from '@/constants';
import { useListBase, useQueryParams } from '@/hooks';
import { route } from '@/routes';
import {
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import { useParams } from 'next/navigation';

export default function VideoLibrarySubtitleList() {
  const { id } = useParams<{ id: string }>();

  const {
    searchParams: { name }
  } = useQueryParams<{ name: string }>();

  const { data, loading } = useListBase<
    VideoLibrarySubtitleResType,
    VideoLibrarySubtitleSearchType
  >({
    apiConfig: apiConfig.videoLibrarySubtitle,
    options: {
      objectName: objectNames.SUBTITLE,
      queryKey: queryKeys.VIDEO_LIBRARY_SUBTITLE,
      defaultFilters: {
        videoLibraryId: id
      },
      notShowFromSearchParams: ['videoLibraryId'],
      excludeFromQueryFilter: ['name']
    }
  });

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: route.videoLibrary.getList.path
        },
        ...(name
          ? [
              {
                label: name
              }
            ]
          : []),
        {
          label: 'Phụ đề'
        }
      ]}
    >
      <ListPageWrapper></ListPageWrapper>
    </PageWrapper>
  );
}
