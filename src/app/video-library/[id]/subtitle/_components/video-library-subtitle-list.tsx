'use client';

import { Col, Row } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { List, ListItem } from '@/components/list';
import { CircleLoading } from '@/components/loading';
import { VideoPlayer } from '@/components/video-player';
import { envConfig } from '@/config';
import { apiConfig, objectNames, queryKeys } from '@/constants';
import { useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { route } from '@/routes';
import { useAuthStore } from '@/store';
import {
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import {
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderListPageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { useParams } from 'next/navigation';

export const VideoLibrarySubtitleList = () => {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: videoLibrary, isLoading: loadingVideoLibrary } =
    useVideoLibraryQuery(id);

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { videoName, parentPage, ...restSearchParams } = parentParams;

  const { data: subtitleList, loading } = useListBase<
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
      notShowFromSearchParams: ['videoLibraryId']
    }
  });

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: renderListPageUrl(
            route.videoLibrary.getList.path,
            serializeParams({ ...restSearchParams, page: parentPage })
          )
        },
        ...(videoName
          ? [
              {
                label: videoName
              }
            ]
          : []),
        {
          label: 'Phụ đề'
        }
      ]}
    >
      <ListPageWrapper>
        <Row className='grid-row-no-gutters'>
          <Col className='grid-c-9 grid-col-no-gutters'>
            {loadingVideoLibrary ? (
              <CircleLoading className='stroke-main-color m-4' />
            ) : videoLibrary ? (
              <VideoPlayer
                auth={true}
                src={renderVideoUrl(
                  videoLibrary.hostname,
                  videoLibrary.content,
                  videoLibrary.sourceType
                )}
                token={accessToken || ''}
                duration={videoLibrary.duration}
                introEnd={videoLibrary.introEnd}
                introStart={videoLibrary.introStart}
                outroStart={videoLibrary.outroStart}
                thumbnailUrl={renderImageUrl(videoLibrary.thumbnailUrl)}
                vttUrl={renderVttUrl(
                  videoLibrary.hostname,
                  videoLibrary.vttUrl,
                  videoLibrary.sourceType
                )}
                volume={
                  envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
                    ? 0
                    : isMobileDevice() || isTabletDevice()
                      ? 1
                      : 0.5
                }
              />
            ) : (
              <p className='text-center'>Không tìm thấy video</p>
            )}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters'>
            <List>
              {subtitleList.map((subtitle) => (
                <ListItem
                  className='cursor-pointer p-2 transition-colors duration-200 ease-linear hover:bg-gray-300'
                  key={subtitle.id}
                >
                  {subtitle.language}
                </ListItem>
              ))}
            </List>
          </Col>
        </Row>
      </ListPageWrapper>
    </PageWrapper>
  );
};
