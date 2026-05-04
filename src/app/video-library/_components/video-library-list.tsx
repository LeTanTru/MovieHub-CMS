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
  objectNames
} from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import { useServerConfigListQuery } from '@/queries';
import { videoLibrarySearchSchema } from '@/schemaValidations';
import type {
  Column,
  SearchFormProps,
  VideoLibraryResType,
  VideoLibrarySearchType
} from '@/types';
import { formatSecondsToHMS, notify, renderImageUrl } from '@/utils';
import { LucideLoader, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import useVideoLibraryStore from '@/store/video-library.store';

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

  const { data, pagination, loading, handlers } = useListBase<
    VideoLibraryResType,
    VideoLibrarySearchType
  >({
    apiConfig: apiConfig.videoLibrary,
    options: {
      queryKey: queryKeys.VIDEO_LIBRARY,
      objectName: objectNames.VIDEO
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
      render: (value) =>
        value === VIDEO_LIBRARY_STATE_PROCESSING ? (
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
          <ToolTip title='Lỗi'>
            <div>
              <FaExclamationTriangle className='mx-auto size-5 text-rose-500' />
            </div>
          </ToolTip>
        ),
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        watchVideo: true,
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.videoLibrary.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.videoLibrary.delete.permissionCode]
        })
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
        options: videoLibrarySourceTypeOptions
      },
      {
        key: 'state',
        placeholder: 'Tình trạng',
        type: FieldTypes.SELECT,
        options: videoLibraryStateOptions
      },
      {
        key: 'serverConfigId',
        placeholder: 'Máy chủ',
        type: FieldTypes.SELECT,
        options: serverConfigOptions
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
