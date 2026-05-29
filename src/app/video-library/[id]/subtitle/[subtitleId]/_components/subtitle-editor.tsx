'use client';

import { SubtitleTranscriptPanel } from './subtitle-transcript-panel';
import { Col, Row } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { envConfig } from '@/config';
import {
  apiConfig,
  languageOptions,
  objectNames,
  queryKeys,
  SUBTITLE_COMPLETE
} from '@/constants';
import { useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { route } from '@/routes';
import { useAuthStore } from '@/store';
import {
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import {
  generatePath,
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderListPageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { TrackProps } from '@vidstack/react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => <CircleLoading className='stroke-main-color m-4' />
  }
);

export function SubtitleEditor() {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [playerHeight, setPlayerHeight] = useState(0);

  const { id: videoLibraryId } = useParams<{
    id: string;
    subtitleId: string;
  }>();

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();

  const parentParams = deprefixParams(searchParams);
  const {
    videoName,
    parentPage,
    language: _language,
    ...restParentParams
  } = parentParams;

  const { p_language: _p_language, ...restSearchParams } = searchParams;

  const languageLabel = languageOptions.find(
    (lang) => lang.value === restSearchParams.language
  )?.label;

  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: videoLibrary, isLoading: loadingVideoLibrary } =
    useVideoLibraryQuery(videoLibraryId);

  const { data: subtitleList, loading } = useListBase<
    VideoLibrarySubtitleResType,
    VideoLibrarySubtitleSearchType
  >({
    apiConfig: apiConfig.videoLibrarySubtitle,
    options: {
      objectName: objectNames.SUBTITLE,
      queryKey: queryKeys.VIDEO_LIBRARY_SUBTITLE,
      defaultFilters: {
        videoLibraryId
      },
      notShowFromSearchParams: ['videoLibraryId']
    }
  });

  const textTracks: TrackProps[] = videoLibrary
    ? subtitleList.flatMap((subtitle) =>
        subtitle.state === SUBTITLE_COMPLETE
          ? [
              {
                src: renderVttUrl(
                  videoLibrary.hostname,
                  subtitle.fileUrl,
                  videoLibrary.sourceType
                ),
                label: subtitle.label,
                language: subtitle.language,
                kind: 'subtitles',
                type: 'vtt',
                default: subtitle.isDefault
              }
            ]
          : []
      )
    : [];

  useEffect(() => {
    const element = playerContainerRef.current;

    if (!element) return;

    const updateHeight = () => {
      setPlayerHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [loading, loadingVideoLibrary, videoLibrary]);

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: renderListPageUrl(
            route.videoLibrary.getList.path,
            serializeParams({ ...restParentParams, page: parentPage })
          )
        },
        ...(videoName
          ? [
              {
                label: videoName as string
              }
            ]
          : []),
        {
          label: 'Phá»¥ Ä‘á»',
          href: renderListPageUrl(
            generatePath(route.videoLibrary.subtitle.path, {
              id: videoLibraryId
            }),
            serializeParams(restSearchParams)
          )
        },
        {
          label: languageLabel
            ? `Chá»‰nh sá»­a ná»™i dung ${languageLabel}`
            : 'Chá»‰nh sá»­a ná»™i dung'
        }
      ]}
      notFound={!videoLibrary && !loadingVideoLibrary}
      notFoundContent='KhÃ´ng tÃ¬m tháº¥y video'
    >
      <ListPageWrapper>
        <Row className='grid-row-no-gutters items-stretch'>
          <Col className='grid-c-9 grid-col-no-gutters'>
            {loading || loadingVideoLibrary ? (
              <CircleLoading className='stroke-main-color m-4' />
            ) : videoLibrary ? (
              <div ref={playerContainerRef} className='aspect-video w-full'>
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
                  textTracks={textTracks}
                />
              </div>
            ) : (
              <p className='text-center'>KhÃ´ng tÃ¬m tháº¥y video</p>
            )}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters h-full'>
            {subtitleList?.length && videoLibrary && (
              <SubtitleTranscriptPanel
                subtitle={subtitleList[0]}
                videoLibrary={videoLibrary}
                height={playerHeight}
              />
            )}
          </Col>
        </Row>
      </ListPageWrapper>
    </PageWrapper>
  );
}
