'use client';

import { apiConfig, objectNames, queryKeys } from '@/constants';
import { CircleLoading } from '@/components/loading';
import { Col, Row } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { route } from '@/routes';
import { SubtitleForm } from './subtitle-form';
import { SubtitlePreviewPlayer } from './subtitle-preview-player';
import { SubtitleTranscriptPanel } from './subtitle-transcript-panel';
import { useElementHeight } from '../_hooks/use-element-height';
import { useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { useVideoLibrarySubtitleStore } from '@/store';
import {
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

export function SubtitleEditor() {
  const [playerHeight, playerContainerRef] = useElementHeight();
  const [subtitleFormHeight, subtitleFormContainerRef] = useElementHeight();

  const {
    isSubtitleFormSwitchConfirmOpen,
    setSubtitleFormSwitchConfirmOpen,
    confirmSubtitleFormSwitch
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      isSubtitleFormSwitchConfirmOpen: s.isSubtitleFormSwitchConfirmOpen,
      setSubtitleFormSwitchConfirmOpen: s.setSubtitleFormSwitchConfirmOpen,
      confirmSubtitleFormSwitch: s.confirmSubtitleFormSwitch
    }))
  );

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

  const videoSubtitle = subtitleList.find(
    (subtitle) => subtitle.language === p_language
  );

  const transcriptPanelHeight = playerHeight + subtitleFormHeight;

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
          label: videoSubtitle
            ? `Chỉnh sửa nội dung ${videoSubtitle.label}`
            : 'Chỉnh sửa nội dung'
        }
      ]}
      loading={loading || loadingVideoLibrary}
      notFound={
        !(loading || loadingVideoLibrary) && (!videoLibrary || !videoSubtitle)
      }
      notFoundContent={`Không tìm thấy ${videoLibrary ? 'phụ đề' : 'video'}`}
    >
      <ListPageWrapper>
        <Row className='grid-row-no-gutters items-stretch'>
          <Col className='grid-c-9 grid-col-no-gutters'>
            {loading || loadingVideoLibrary ? (
              <CircleLoading className='stroke-sporty-blue m-4' />
            ) : videoLibrary && videoSubtitle ? (
              <>
                <SubtitlePreviewPlayer
                  videoLibrary={videoLibrary}
                  playerContainerRef={playerContainerRef}
                />
                <div ref={subtitleFormContainerRef} className='flex flex-col'>
                  <SubtitleForm />
                </div>
              </>
            ) : null}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters h-full'>
            {videoSubtitle && videoLibrary && (
              <SubtitleTranscriptPanel
                videoSubtitle={videoSubtitle}
                videoLibrary={videoLibrary}
                height={transcriptPanelHeight}
              />
            )}
          </Col>
        </Row>
      </ListPageWrapper>
      <ConfirmModal
        open={isSubtitleFormSwitchConfirmOpen}
        onOpenChange={setSubtitleFormSwitchConfirmOpen}
        message='Bạn có chắc chắn muốn hủy không ?'
        onConfirm={confirmSubtitleFormSwitch}
      />
    </PageWrapper>
  );
}
