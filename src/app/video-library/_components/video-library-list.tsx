'use client';

import VideoLibraryPreviewModal from '@/app/video-library/_components/video-library-preview-modal';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  VIDEO_LIBRARY_STATE_COMPLETE,
  VIDEO_LIBRARY_STATE_PROCESSING,
  videoLibraryStateOptions
} from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import { videoLibrarySearchSchema } from '@/schemaValidations';
import {
  Column,
  SearchFormProps,
  VideoLibraryResType,
  VideoLibrarySearchType
} from '@/types';
import { notify, renderImageUrl } from '@/utils';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { AiFillWarning, AiOutlineFileImage } from 'react-icons/ai';
import { RiCheckboxCircleFill, RiLoader2Fill } from 'react-icons/ri';

export default function VideoLibraryList({ queryKey }: { queryKey: string }) {
  const videoLibraryPreviewModal = useDisclosure(false);
  const [selectedVideoLibrary, setSelectedVideoLibrary] =
    useState<VideoLibraryResType>();
  const { data, pagination, loading, handlers } = useListBase<
    VideoLibraryResType,
    VideoLibrarySearchType
  >({
    apiConfig: apiConfig.videoLibary,
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
          <ToolTip title={`Xem video`}>
            <span>
              <Button
                disabled={record.state !== VIDEO_LIBRARY_STATE_COMPLETE}
                onClick={() => handleOpenVideoLibraryPreviewModal(record)}
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

  const handleOpenVideoLibraryPreviewModal = (
    videoLibrary: VideoLibraryResType
  ) => {
    setSelectedVideoLibrary(videoLibrary);
    videoLibraryPreviewModal.open();
  };

  const columns: Column<VideoLibraryResType>[] = [
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
          zoomSize={800}
          icon={<AiOutlineFileImage className='size-7 text-slate-800' />}
        />
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
      title: 'Tình trạng',
      dataIndex: 'state',
      render: (value) =>
        value === VIDEO_LIBRARY_STATE_PROCESSING ? (
          <ToolTip title='Đang xử lý' sideOffset={4}>
            <div>
              <RiLoader2Fill className='mx-auto size-5 animate-spin' />
            </div>
          </ToolTip>
        ) : value === VIDEO_LIBRARY_STATE_COMPLETE ? (
          <ToolTip title='Đang xử lý' sideOffset={4}>
            <div>
              <RiCheckboxCircleFill className='mx-auto size-5 text-green-600' />
            </div>
          </ToolTip>
        ) : (
          <ToolTip title='Lỗi' sideOffset={4}>
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
        key: 'state',
        placeholder: 'Tình trạng',
        type: FieldTypes.SELECT,
        options: videoLibraryStateOptions
      }
    ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Danh mục' }]}>
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
      <VideoLibraryPreviewModal
        open={videoLibraryPreviewModal.opened}
        close={videoLibraryPreviewModal.close}
        videoLibrary={selectedVideoLibrary}
      />
    </PageWrapper>
  );
}
