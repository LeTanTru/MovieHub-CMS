'use client';

import { SubtitlePreviewPlayer } from './subtitle-preview-player';
import { SubtitleTranscriptPanel } from './subtitle-transcript-panel';
import { Col, Row } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  objectNames,
  queryKeys,
  SUBTITLE_COMPLETE
} from '@/constants';
import { useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { route } from '@/routes';
import {
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import { generatePath, renderListPageUrl, renderVttUrl } from '@/utils';
import { TrackProps } from '@vidstack/react';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

export function SubtitleEditor() {
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

  const { p_language, ...restSearchParams } = searchParams;

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

  const targetSubtitle = subtitleList.find(
    (subtitle) => subtitle.language === p_language
  );

  const textTracks: TrackProps[] = videoLibrary
    ? subtitleList.flatMap((subtitle) =>
        subtitle.state === SUBTITLE_COMPLETE && subtitle.language === p_language
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

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const playerContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (node) {
      const updateHeight = () => {
        setPlayerHeight(node.getBoundingClientRect().height);
      };
      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(node);
      resizeObserverRef.current = resizeObserver;
    }
  }, []);
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
          label: 'Phụ đề',
          href: renderListPageUrl(
            generatePath(route.videoLibrary.subtitle.path, {
              id: videoLibraryId
            }),
            serializeParams(restSearchParams)
          )
        },
        {
          label: targetSubtitle
            ? `Chỉnh sửa nội dung ${targetSubtitle.label}`
            : 'Chỉnh sửa nội dung'
        }
      ]}
      notFound={!videoLibrary || !targetSubtitle}
      notFoundContent={`Không tìm thấy ${videoLibrary ? 'phụ đề' : 'video'}`}
    >
      <ListPageWrapper>
        <Row className='grid-row-no-gutters items-stretch'>
          <Col className='grid-c-9 grid-col-no-gutters'>
            {loading || loadingVideoLibrary ? (
              <CircleLoading className='stroke-main-color m-4' />
            ) : videoLibrary ? (
              <SubtitlePreviewPlayer
                videoLibrary={videoLibrary}
                playerContainerRef={playerContainerRef}
                textTracks={textTracks}
              />
            ) : null}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters h-full'>
            {targetSubtitle && videoLibrary && (
              <SubtitleTranscriptPanel
                subtitle={targetSubtitle}
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
