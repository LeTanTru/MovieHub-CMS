'use client';

import VideoLibraryPreviewModal from '@/app/movie/[id]/movie-item/_components/video-library-preview-modal';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
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
import { formatDate, getData, renderImageUrl, setData } from '@/utils';
import { PlayCircle, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineFileImage } from 'react-icons/ai';

export default function MovieItemList({ queryKey }: { queryKey: string }) {
  const [selectedKey, setSelectedKey] = useState<number | string | null>(null);

  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();
  const videoLibraryPreviewModal = useDisclosure(false);
  const [selectedVideoLibrary, setSelectedVideoLibrary] =
    useState<VideoLibraryResType>();
  const { id: movieId } = useParams<{ id: string }>();
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
          <ToolTip title={`Xem video`}>
            <span>
              <Button
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
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
    }
  });

  const handleOpenVideoLibraryPreviewModal = (movieItem: MovieItemResType) => {
    setSelectedVideoLibrary(movieItem.video);
    videoLibraryPreviewModal.open();
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
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
          zoomSize={850}
          icon={<AiOutlineFileImage className='size-7 text-slate-800' />}
        />
      )
    },
    {
      title: 'Tiêu đề mục phim',
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn({
            'font-bold uppercase': record.kind === MOVIE_ITEM_KIND_SEASON,
            'ml-4 italic': record.kind === MOVIE_ITEM_KIND_TRAILER,
            'ml-4': record.kind === MOVIE_ITEM_KIND_EPISODE
          })}
        >
          {record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}: `}
          {record.kind === MOVIE_ITEM_KIND_EPISODE && `${record.label}. `}
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
            if (record.kind === MOVIE_ITEM_KIND_TRAILER) return;
            if (selectedKey === record.id) {
              setSelectedKey(null);
              setData(storageKeys.SELECTED_MOVIE_ITEM, '');
            } else {
              setSelectedKey(record.id);
              setData(storageKeys.SELECTED_MOVIE_ITEM, record.id);
            }
          }}
          rowClassName={(row) =>
            row.id.toString() === selectedKey?.toString()
              ? 'bg-gray-400/50 hover:bg-gray-400/50'
              : ''
          }
        />
        {sortedData.length > 1 && (
          <div className='mr-4 flex justify-end py-4'>
            <Button
              onClick={handleUpdate}
              disabled={!isChanged || loading || loadingUpdateOrdering}
              className='w-40'
              variant={'primary'}
            >
              {loading || loadingUpdateOrdering ? (
                <CircleLoading />
              ) : (
                <>
                  <Save />
                  Cập nhật
                </>
              )}
            </Button>
          </div>
        )}
      </ListPageWrapper>
      <VideoLibraryPreviewModal
        open={videoLibraryPreviewModal.opened}
        close={videoLibraryPreviewModal.close}
        videoLibrary={selectedVideoLibrary}
      />
    </PageWrapper>
  );
}
