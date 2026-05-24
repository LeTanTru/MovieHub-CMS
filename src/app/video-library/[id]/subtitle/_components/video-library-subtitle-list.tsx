'use client';

import { Button, Col, Row, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { List, ListItem } from '@/components/list';
import { CircleLoading } from '@/components/loading';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => <CircleLoading className='stroke-main-color m-4' />
  }
);

import { envConfig } from '@/config';
import {
  apiConfig,
  objectNames,
  queryKeys,
  SUBTITLE_COMPLETE,
  SUBTITLE_LOADING
} from '@/constants';
import { useDisclosure, useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { route } from '@/routes';
import { useAuthStore } from '@/store';
import { useState } from 'react';
import { VideoLibrarySubtitleModal } from './video-library-subtitle-modal';
import { VideoLibrarySubtitleTranslateModal } from './video-library-subtitle-translate-modal';
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
import { ConfirmModal } from '@/components/modal';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BadgeCheck, PlusIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { HasPermission } from '@/components/has-permission';
import { NoData } from '@/components/no-data';
import { TrackProps } from '@vidstack/react';

export function VideoLibrarySubtitleList() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: videoLibrary, isLoading: loadingVideoLibrary } =
    useVideoLibraryQuery(id);

  const [selectedSubtitle, setSelectedSubtitle] =
    useState<VideoLibrarySubtitleResType | null>(null);

  const {
    opened: openedEditModal,
    open: openEditModal,
    close: closeEditModal
  } = useDisclosure();
  const {
    opened: openedTranslateModal,
    open: openTranslateModal,
    close: closeTranslateModal
  } = useDisclosure();

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { videoName, parentPage, ...restSearchParams } = parentParams;

  const { data: subtitleList, handlers } = useListBase<
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

  const canEdit = handlers.hasPermission({
    requiredPermissions: [apiConfig.videoLibrarySubtitle.update.permissionCode]
  });

  const canDelete = handlers.hasPermission({
    requiredPermissions: [apiConfig.videoLibrarySubtitle.delete.permissionCode]
  });

  const renderAddButton = () => {
    const defaultSubtitle = subtitleList?.find((sub) => sub.isDefault);
    return (
      <HasPermission
        requiredPermissions={[
          apiConfig.videoLibrarySubtitle.translate.permissionCode
        ]}
      >
        <Button
          onClick={openTranslateModal}
          variant='primary'
          disabled={!defaultSubtitle}
        >
          <PlusIcon />
          Thêm mới phụ đề
        </Button>
      </HasPermission>
    );
  };

  // const textTracks: TrackProps[] = [
  //   {
  //     src: 'https://files.vidstack.io/sprite-fight/subs/english.vtt',
  //     label: 'English',
  //     language: 'en-US',
  //     kind: 'subtitles',
  //     type: 'vtt',
  //     default: true
  //   },
  //   {
  //     src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
  //     label: 'Spanish',
  //     language: 'es-ES',
  //     kind: 'subtitles',
  //     type: 'vtt'
  //   }
  // ];

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
                label: videoName as string
              }
            ]
          : []),
        {
          label: 'Phụ đề'
        }
      ]}
      notFound={!videoLibrary && !loadingVideoLibrary}
      notFoundContent='Không tìm thấy video'
    >
      <ListPageWrapper
        addButton={renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
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
                textTracks={textTracks}
              />
            ) : (
              <p className='text-center'>Không tìm thấy video</p>
            )}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters'>
            <List>
              {subtitleList.length === 0 ? (
                <NoData />
              ) : (
                subtitleList.map((subtitle) => (
                  <ListItem
                    className='flex cursor-pointer items-center justify-between px-2 py-1 transition-colors duration-200 ease-linear hover:bg-zinc-100'
                    key={subtitle.id}
                  >
                    <div className='flex items-center gap-2'>
                      <span>
                        {subtitle.label} ({subtitle.language})
                      </span>
                      {subtitle.isDefault && (
                        <ToolTip title='Mặc định'>
                          <BadgeCheck className='fill-main-color size-6 stroke-white' />
                        </ToolTip>
                      )}
                      {subtitle.state === SUBTITLE_LOADING && (
                        <CircleLoading className='stroke-main-color size-5' />
                      )}
                    </div>
                    <div className='flex items-center justify-center'>
                      {canEdit && (
                        <ToolTip
                          title={`Cập nhật phụ đề tiếng ${subtitle.language}`}
                          sideOffset={0}
                        >
                          <span>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubtitle(subtitle);
                                openEditModal();
                              }}
                              className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                              variant='ghost'
                            >
                              <AiOutlineEdit className='text-main-color size-4' />
                            </Button>
                          </span>
                        </ToolTip>
                      )}
                      {canEdit && (
                        <Separator
                          orientation='vertical'
                          className='h-4! w-px!'
                        />
                      )}
                      {canDelete && (
                        <ConfirmModal
                          message={`Bạn có chắc chắn muốn xóa phụ đề ${subtitle.language} này không ?`}
                          onConfirm={() =>
                            handlers.handleDeleteClick(subtitle.id)
                          }
                          trigger={
                            <span>
                              <ToolTip
                                title={`Xoá phụ đề ${subtitle.language}`}
                                sideOffset={0}
                              >
                                <Button
                                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                                  variant='ghost'
                                  disabled={subtitle.isDefault}
                                >
                                  <AiOutlineDelete className='text-destructive size-4' />
                                </Button>
                              </ToolTip>
                            </span>
                          }
                        />
                      )}
                    </div>
                  </ListItem>
                ))
              )}
            </List>
          </Col>
        </Row>
      </ListPageWrapper>
      <VideoLibrarySubtitleModal
        open={openedEditModal}
        onClose={closeEditModal}
        subtitle={selectedSubtitle}
      />
      <VideoLibrarySubtitleTranslateModal
        open={openedTranslateModal}
        defaultSubtitleId={subtitleList?.find((sub) => sub.isDefault)?.id || ''}
        onClose={closeTranslateModal}
      />
    </PageWrapper>
  );
}
