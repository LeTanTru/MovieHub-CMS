'use client';

import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  DEFAULT_DATE_FORMAT,
  FieldTypes,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_EPISODE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_ITEM_KIND_TRAILER,
  MOVIE_TYPE_SERIES,
  MOVIE_TYPE_SINGLE,
  movieItemKindOptions,
  movieItemSeriesKindOptions,
  movieItemSingleKindOptions,
  storageKeys
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useQueryParams
} from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import { movieItemSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieItemResType,
  MovieItemSearchType,
  SearchFormProps,
  VideoLibraryResType
} from '@/types';
import {
  formatDate,
  formatSecondsToHMS,
  getData,
  removeData,
  renderImageUrl,
  setData
} from '@/utils';
import { PlayCircle, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import VideoPlayModal from './video-play-modal';

export default function MovieItemList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();
  const [selectedKey, setSelectedKey] = useState<number | string | null>(null);

  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();
  const playModal = useDisclosure(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: 'mục phim',
      excludeFromQueryFilter: ['type'],
      defaultFilters: {
        movieId
      },
      notShowFromSearchParams: ['movieId']
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        watchVideo: (
          record: MovieItemResType,
          buttonProps?: Record<string, any>
        ) => (
          <ToolTip title={`Xem video`} sideOffset={0}>
            <span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPlayModal(record);
                }}
                className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                {...buttonProps}
                disabled={!record.video || !record.video.duration}
              >
                <PlayCircle className='text-dodger-blue size-4' />
              </Button>
            </span>
          </ToolTip>
        )
      });
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
    }
  });

  const handleOpenPlayModal = (movieItem: MovieItemResType) => {
    setSelectedVideo(movieItem.video);
    playModal.open();
  };

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<MovieItemResType>({
    key: `${queryKey}-list`,
    objectName: 'mục phim',
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering',
    mappingData: (record, index) => ({
      id: record.id,
      ordering: index,
      parentId: record?.parent?.id
    })
  });

  const columns: Column<MovieItemResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
        />
      )
    },
    {
      title: 'Tiêu đề mục phim',
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn('line-clamp-1 block truncate', {
            'font-bold uppercase': record.kind === MOVIE_ITEM_KIND_SEASON,
            'ml-4 italic': record.kind === MOVIE_ITEM_KIND_TRAILER,
            'ml-4': record.kind === MOVIE_ITEM_KIND_EPISODE
          })}
          title={`${record.kind === MOVIE_ITEM_KIND_SEASON ? `Mùa ${record.label}: ` : ''} ${record.kind === MOVIE_ITEM_KIND_EPISODE ? `${record.label}. ` : ''}${value}`}
        >
          {record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}: `}
          {record.kind === MOVIE_ITEM_KIND_EPISODE && `${record.label}. `}
          {record.kind === MOVIE_ITEM_KIND_TRAILER && `${record.label} `}
          {value}
        </span>
      )
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'releaseDate',
      width: 150,
      render: (value) => formatDate(value, DEFAULT_DATE_FORMAT),
      align: 'center'
    },
    {
      title: 'Thời lượng',
      width: 120,
      render: (_, record) => {
        if (record.video) {
          return formatSecondsToHMS(record.video.duration);
        }
        return '------';
      },
      align: 'center'
    },
    {
      title: 'Loại mục phim',
      dataIndex: 'kind',
      width: 150,
      render: (value) => {
        const label = movieItemKindOptions.find(
          (kind) => kind.value === value
        )?.label;
        return label ?? '------';
      },
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        watchVideo: (record) =>
          (!!type && +type !== MOVIE_TYPE_SERIES) ||
          record.kind !== MOVIE_ITEM_KIND_SEASON,
        edit: true,
        delete: true
      },
      columnProps: {
        fixed: true
      }
    })
  ];

  const searchFields: SearchFormProps<MovieItemSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tên mục phim' },
    {
      key: 'kind',
      placeholder: 'Loại',
      type: FieldTypes.SELECT,
      options:
        !!type && +type === MOVIE_TYPE_SINGLE
          ? movieItemSingleKindOptions
          : movieItemSeriesKindOptions
    }
  ];

  useEffect(() => {
    setSelectedKey(getData(storageKeys.SELECTED_MOVIE_ITEM));
  }, []);

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: 'Mục phim' }
      ]}
    >
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: movieItemSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={loading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
          onSelectRow={(record) => {
            if (record.kind !== MOVIE_ITEM_KIND_SEASON) return;

            if (selectedKey === record.id.toString()) {
              setSelectedKey(null);
              removeData(storageKeys.SELECTED_MOVIE_ITEM);
            } else {
              setSelectedKey(record.id.toString());
              setData(storageKeys.SELECTED_MOVIE_ITEM, record.id.toString());
            }
          }}
          rowClassName={(row) =>
            cn({
              'bg-gray-400/50 hover:bg-gray-400/50':
                row.id.toString() === selectedKey?.toString(),
              'cursor-pointer': row.kind === MOVIE_ITEM_KIND_SEASON
            })
          }
        />
        {sortedData.length > 1 && (
          <div className='mr-4 flex justify-end py-4'>
            <Button
              onClick={() => handleUpdate()}
              disabled={!isChanged || loading || loadingUpdateOrdering}
              className='w-40'
              variant={'primary'}
              loading={loading || loadingUpdateOrdering}
            >
              <Save />
              Cập nhật
            </Button>
          </div>
        )}
      </ListPageWrapper>
      <VideoPlayModal
        open={playModal.opened}
        close={playModal.close}
        video={selectedVideo}
      />
    </PageWrapper>
  );
}
