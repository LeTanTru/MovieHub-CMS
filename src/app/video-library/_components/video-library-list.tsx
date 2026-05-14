'use client';

import VideoPlayModal from './video-play-modal';
import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  VIDEO_LIBRARY_STATE_COMPLETE,
  VIDEO_LIBRARY_STATE_PROCESSING,
  videoLibrarySourceTypeOptions,
  videoLibraryStateOptions,
  queryKeys,
  MAX_PAGE_SIZE,
  DEFAULT_TABLE_PAGE_START,
  DEFAULT_TABLE_PAGE_SIZE,
  objectNames,
  VIDEO_LIBRARY_STATE_ERROR,
  videoLibraryErrorReasons,
  AUDIO_STATE_COMPLETE,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
} from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import {
  useProcessAudioVideoLibraryMutation,
  useRetryProcessVideoLibraryMutation,
  useServerConfigListQuery
} from '@/queries';
import { videoLibrarySearchSchema } from '@/schemaValidations';
import type {
  Column,
  SearchFormProps,
  VideoLibraryResType,
  VideoLibrarySearchType
} from '@/types';
import { formatSecondsToHMS, notify, renderImageUrl } from '@/utils';
import { AudioLines, LucideLoader, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCircleCheck, FaRotateRight } from 'react-icons/fa6';
import { logger } from '@/logger';
import { useVideoLibraryStore } from '@/store';

export default function VideoLibraryList() {
  const {
    opened: openedPlayModal,
    open: openPlayModal,
    close: closePlayModal
  } = useDisclosure();

  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();
  const targetVideoId = useVideoLibraryStore((s) => s.targetVideoId);
  const setTargetVideoId = useVideoLibraryStore((s) => s.setTargetVideoId);

  const { data: serverConfigListData } = useServerConfigListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const serverConfigOptions =
    serverConfigListData?.content?.map((sc) => ({
      label: sc.name,
      value: sc.id
    })) || [];

  const { mutateAsync: retryProcessMutate, isPending: retryProcessLoading } =
    useRetryProcessVideoLibraryMutation();

  const { mutateAsync: processAudioMutate, isPending: processAudioLoading } =
    useProcessAudioVideoLibraryMutation();

  const { data, pagination, loading, handlers } = useListBase<
    VideoLibraryResType,
    VideoLibrarySearchType
  >({
    apiConfig: apiConfig.videoLibrary,
    options: {
      queryKey: queryKeys.VIDEO_LIBRARY,
      objectName: objectNames.VIDEO,
      defaultFilters: {
        sourceType: VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
      }
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.VIDEO_LIBRARY_ERROR_MOVIE_ITEM_EXIST) {
          notify.error('Video này có mục phim đang liên kết');
        }
      };

      handlers.additionalColumns = () => ({
        watchVideo: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleOpenPlayModal = (video: VideoLibraryResType) => {
            setSelectedVideo(video);
            openPlayModal();
          };

          return (
            <ToolTip title='Xem video' sideOffset={0}>
              <span>
                <Button
                  disabled={record.state !== VIDEO_LIBRARY_STATE_COMPLETE}
                  onClick={() => handleOpenPlayModal(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <PlayCircle className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        retryProcess: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleRetryProcess = async (record: VideoLibraryResType) => {
            await retryProcessMutate(
              {
                id: record.id,
                content: record.content
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success('Gửi yêu cầu xử lý lại video thành công');
                    handlers.invalidateQueries();
                  }
                },
                onError: (error) => {
                  logger.error('[RETRY_PROCESS_VIDEO_LIBRARY]', error);
                  notify.error('Gửi yêu cầu xử lý lại video thất bại');
                }
              }
            );
          };

          return (
            <ToolTip title='Xử lý lại video' sideOffset={0}>
              <span>
                <Button
                  disabled={retryProcessLoading}
                  onClick={() => handleRetryProcess(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <FaRotateRight className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        processAudio: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleProcessAudio = async (record: VideoLibraryResType) => {
            await processAudioMutate(
              {
                id: record.id
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success('Gửi yêu cầu tách audio thành công');
                    handlers.invalidateQueries();
                  }
                },
                onError: (error) => {
                  logger.error('[PROCESS_AUDIO_VIDEO_LIBRARY]', error);
                  notify.error('Gửi yêu cầu tách audio thất bại');
                }
              }
            );
          };

          return (
            <ToolTip title='Tách audio' sideOffset={0}>
              <span>
                <Button
                  disabled={processAudioLoading}
                  onClick={() => handleProcessAudio(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <AudioLines className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });

      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.VIDEO_LIBRARY_ERROR_NO_SERVER_CONFIG) {
          notify.error(
            'Không thể xóa video không có liên kết với bất kỳ máy chủ nào'
          );
        }
      };
    }
  });

  const columns: Column<VideoLibraryResType>[] = [
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 110,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          aspect={16 / 9}
          previewAspect={16 / 9}
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      render: (value) => (
        <span className='line-clamp-1 block truncate'>
          {formatSecondsToHMS(value)}
        </span>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: 'Tình trạng',
      dataIndex: 'state',
      render: (value) => {
        const reasonLabel = videoLibraryErrorReasons.find(
          (reason) => reason.value === value
        )?.label;
        return value === VIDEO_LIBRARY_STATE_PROCESSING ? (
          <ToolTip title='Đang xử lý'>
            <div>
              <LucideLoader className='mx-auto size-5 animate-spin' />
            </div>
          </ToolTip>
        ) : value === VIDEO_LIBRARY_STATE_COMPLETE ? (
          <ToolTip title='Đã hoàn thành'>
            <div>
              <FaCircleCheck className='mx-auto size-5 text-emerald-500' />
            </div>
          </ToolTip>
        ) : (
          <ToolTip title={`Lỗi: ${reasonLabel || 'N/A'}`}>
            <div>
              <FaExclamationTriangle className='mx-auto size-5 text-rose-500' />
            </div>
          </ToolTip>
        );
      },
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        watchVideo: true,
        retryProcess: (record) =>
          record.state === VIDEO_LIBRARY_STATE_ERROR &&
          handlers.hasPermission({
            requiredPermissions: [
              apiConfig.videoLibrary.retryProcess.permissionCode
            ]
          }),
        processAudio: (record) =>
          record.audioState !== AUDIO_STATE_COMPLETE &&
          record.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL &&
          handlers.hasPermission({
            requiredPermissions: [
              apiConfig.videoLibrary.processAudio.permissionCode
            ]
          }),
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.videoLibrary.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.videoLibrary.delete.permissionCode]
        })
      },
      columnProps: {
        width: 180
      }
    })
  ];

  const searchFields: SearchFormProps<VideoLibrarySearchType>['searchFields'] =
    [
      { key: 'name', placeholder: 'Tên' },
      {
        key: 'sourceType',
        placeholder: 'Nguồn',
        type: FieldTypes.SELECT,
        options: videoLibrarySourceTypeOptions,
        submitOnChanged: true
      },
      {
        key: 'state',
        placeholder: 'Tình trạng',
        type: FieldTypes.SELECT,
        options: videoLibraryStateOptions,
        submitOnChanged: true
      },
      {
        key: 'serverConfigId',
        placeholder: 'Máy chủ',
        type: FieldTypes.SELECT,
        options: serverConfigOptions,
        submitOnChanged: true
      }
    ];

  // navigate to the page containing targetVideoId, then clear highlight after delay
  useEffect(() => {
    if (!targetVideoId || !data) return;

    const index = data.findIndex((v) => v.id === targetVideoId);
    if (index === -1) return;

    const currentPage = pagination.current;
    const pageSize = pagination.pageSize || DEFAULT_TABLE_PAGE_SIZE;
    const targetPage = Math.floor(index / pageSize) + 1;

    if (currentPage !== targetPage) {
      handlers.changePagination(targetPage);
    }

    const timer = setTimeout(() => setTargetVideoId(null), 2500);
    return () => clearTimeout(timer);
  }, [setTargetVideoId, data, handlers, pagination, targetVideoId]);

  return (
    <PageWrapper breadcrumbs={[{ label: 'Video' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: videoLibrarySearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <BaseTable
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
          rowClassName={(record) =>
            record.id === targetVideoId ? 'bg-main-color/10' : ''
          }
        />
      </ListPageWrapper>
      {selectedVideo && (
        <VideoPlayModal
          open={openedPlayModal}
          onClose={closePlayModal}
          video={selectedVideo}
        />
      )}
    </PageWrapper>
  );
}
