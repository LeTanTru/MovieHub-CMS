'use client';

import { VideoPlayModal } from './video-play-modal';
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
  objectNames,
  VIDEO_LIBRARY_STATE_ERROR,
  videoLibraryErrorReasons,
  AUDIO_STATE_COMPLETE,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
  AUDIO_STATE_PROCESSING,
  NO_SPEECH
} from '@/constants';
import {
  useDisclosure,
  useListBase,
  useNavigate,
  useQueryParams
} from '@/hooks';
import {
  useProcessAudioVideoLibraryMutation,
  useRetryProcessVideoLibraryMutation,
  useServerConfigListQuery
} from '@/queries';
import { videoLibrarySearchSchema } from '@/schema-validations';
import type {
  Column,
  SearchFormProps,
  VideoLibraryResType,
  VideoLibrarySearchType
} from '@/types';
import {
  secondsToTime,
  generatePath,
  notify,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import {
  AudioLines,
  ClosedCaption,
  LucideLoader,
  PlayCircle
} from 'lucide-react';
import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCircleCheck, FaRotateRight } from 'react-icons/fa6';
import { logger } from '@/logger';
import { route } from '@/routes';

export function VideoLibraryList() {
  const navigate = useNavigate();
  const {
    searchParams: { page, ...resetSearchParams },
    serializeParams,
    prefixParams
  } = useQueryParams<{ page?: string }>();

  const {
    opened: openedPlayModal,
    open: openPlayModal,
    close: closePlayModal
  } = useDisclosure();

  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { data: serverConfigListData } = useServerConfigListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const serverConfigOptions =
    serverConfigListData?.content?.map((sc) => ({
      label: sc.name,
      value: sc.id
    })) || [];

  const { mutate: retryProcess, isPending } =
    useRetryProcessVideoLibraryMutation();

  const { mutate: processAudioMutate } = useProcessAudioVideoLibraryMutation();

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
        } else if (code === ErrorCode.VIDEO_LIBRARY_ERROR_NO_SERVER_CONFIG) {
          notify.error(
            'Không thể xóa video không có liên kết với bất kỳ máy chủ nào'
          );
        }
      };

      handlers.additionalColumns = () => ({
        watchVideo: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, unknown>
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
                  <PlayCircle className='text-sporty-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        editSubtitle: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, unknown>
        ) => {
          const handleEditSubtitle = (video: VideoLibraryResType) => {
            navigate.push(
              renderListPageUrl(
                generatePath(route.videoLibrary.subtitle.path, {
                  id: video.id
                }),
                serializeParams(
                  prefixParams({
                    ...resetSearchParams,
                    videoName: video.name,
                    parentPage: page
                  })
                )
              )
            );
          };

          return (
            <ToolTip title='Phụ đề' sideOffset={0}>
              <span>
                <Button
                  disabled={
                    record.audioState !== AUDIO_STATE_COMPLETE ||
                    record.state !== VIDEO_LIBRARY_STATE_COMPLETE
                  }
                  onClick={() => handleEditSubtitle(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <ClosedCaption className='text-sporty-blue size-4.5' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        retryProcess: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, unknown>
        ) => {
          const handleRetryProcess = (record: VideoLibraryResType) => {
            retryProcess(
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
                  disabled={isPending}
                  onClick={() => handleRetryProcess(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <FaRotateRight className='text-sporty-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        processAudio: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, unknown>
        ) => {
          const handleProcessAudio = (record: VideoLibraryResType) => {
            processAudioMutate(
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

          const isNoSpeech = record.reason === NO_SPEECH;

          return (
            <ToolTip
              title={isNoSpeech ? 'Video không có giọng nói' : 'Tách audio'}
              sideOffset={0}
            >
              <span>
                <Button
                  disabled={
                    record.audioState === AUDIO_STATE_PROCESSING ||
                    record.state !== VIDEO_LIBRARY_STATE_COMPLETE ||
                    isNoSpeech
                  }
                  onClick={() => handleProcessAudio(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                  loading={
                    record.audioState === AUDIO_STATE_PROCESSING &&
                    record.state === VIDEO_LIBRARY_STATE_COMPLETE &&
                    !isNoSpeech
                  }
                  iconClassName='stroke-sporty-blue size-4'
                >
                  <AudioLines className='text-sporty-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
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
          src={renderImageUrl(value as string)}
          aspect={16 / 9}
          previewAspect={16 / 9}
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (val) => {
        const value = val as string;
        return (
          <span className='line-clamp-1 block truncate' title={value}>
            {value}
          </span>
        );
      }
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      render: (value) => (
        <span className='line-clamp-1 block truncate'>
          {secondsToTime(value as number)}
        </span>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: 'Tình trạng',
      dataIndex: 'state',
      render: (value, record) => {
        const reasonLabel = videoLibraryErrorReasons.find(
          (reason) => reason.value === record.reason
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
        editSubtitle: (record) =>
          record.audioState === AUDIO_STATE_COMPLETE &&
          record.state === VIDEO_LIBRARY_STATE_COMPLETE,
        retryProcess: (record) =>
          record.state === VIDEO_LIBRARY_STATE_ERROR &&
          handlers.hasPermission({
            requiredPermissions: [
              apiConfig.videoLibrary.retryProcess.permissionCode
            ]
          }),
        processAudio: (record) =>
          record.audioState !== AUDIO_STATE_COMPLETE &&
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
