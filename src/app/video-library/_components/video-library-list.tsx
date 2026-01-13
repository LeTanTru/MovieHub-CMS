'use client';

import VideoPlayModal from './video-play-modal';
import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  socketReceiveCMDs,
  VIDEO_LIBRARY_STATE_COMPLETE,
  VIDEO_LIBRARY_STATE_PROCESSING,
  videoLibrarySourceTypeOptions,
  videoLibraryStateOptions
} from '@/constants';
import { useDisclosure, useListBase, useSocketEvent } from '@/hooks';
import { videoLibrarySearchSchema } from '@/schemaValidations';
import type {
  Column,
  SearchFormProps,
  VideoLibraryResType,
  VideoLibrarySearchType
} from '@/types';
import { formatSecondsToHMS, notify, renderImageUrl } from '@/utils';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { RiCheckboxCircleFill, RiLoader2Fill } from 'react-icons/ri';

export default function VideoLibraryList({ queryKey }: { queryKey: string }) {
  const playModal = useDisclosure(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { data, pagination, loading, handlers, listQuery } = useListBase<
    VideoLibraryResType,
    VideoLibrarySearchType
  >({
    apiConfig: apiConfig.videoLibrary,
    options: {
      queryKey,
      objectName: 'video'
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.VIDEO_LIBRARY_ERROR_MOVIE_ITEM_EXISTED) {
          notify.error('Video này có mục phim đang liên kết');
        }
      };
      handlers.additionalColumns = () => ({
        watchVideo: (
          record: VideoLibraryResType,
          buttonProps?: Record<string, any>
        ) => (
          <ToolTip title={`Xem video`} sideOffset={0}>
            <span>
              <Button
                disabled={record.state !== VIDEO_LIBRARY_STATE_COMPLETE}
                onClick={() => handleOpenPlayModal(record)}
                className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                {...buttonProps}
              >
                <PlayCircle className='text-dodger-blue size-4' />
              </Button>
            </span>
          </ToolTip>
        )
      });
    }
  });

  const handleOpenPlayModal = (video: VideoLibraryResType) => {
    setSelectedVideo(video);
    playModal.open();
  };

  const columns: Column<VideoLibraryResType>[] = [
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <ImageField disablePreview={!value} src={renderImageUrl(value)} />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      render: (value) => (
        <span className='line-clamp-1 block truncate'>
          {formatSecondsToHMS(value) ?? '------'}
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
              <RiLoader2Fill className='mx-auto size-5 animate-spin' />
            </div>
          </ToolTip>
        ) : value === VIDEO_LIBRARY_STATE_COMPLETE ? (
          <ToolTip title='Đã hoàn thành'>
            <div>
              <RiCheckboxCircleFill className='mx-auto size-5 text-green-600' />
            </div>
          </ToolTip>
        ) : (
          <ToolTip title='Lỗi'>
            <div>
              <AiFillWarning className='text-destructive mx-auto size-5' />
            </div>
          </ToolTip>
        ),
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        watchVideo: true,
        edit: true,
        delete: true
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
      }
    ];

  useSocketEvent(
    socketReceiveCMDs.CMD_BROADCAST,
    socketReceiveCMDs.CMD_DONE_CONVERT_VIDEO,
    () => listQuery.refetch()
  );

  return (
    <PageWrapper breadcrumbs={[{ label: 'Thư viện video' }]}>
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
          open={playModal.opened}
          onClose={playModal.close}
          video={selectedVideo}
        />
      )}
    </PageWrapper>
  );
}
