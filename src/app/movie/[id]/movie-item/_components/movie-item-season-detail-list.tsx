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
  movieItemSingleKindOptions
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
  generatePath,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { PlayCircle, PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import VideoPlayModal from './video-play-modal';
import { HasPermission } from '@/components/has-permission';
import MovieItemModal from './movie-item-modal';
import { AiOutlineEdit } from 'react-icons/ai';

export default function MovieItemSeasonDetailList({
  queryKey
}: {
  queryKey: string;
}) {
  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();
  const { searchParams, serializeParams } = useQueryParams<{
    type: string;
    season: string;
    movieTitle: string;
  }>();

  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();

  const movieItemModal = useDisclosure(false);
  const [movieItem, setMovieItem] = useState<MovieItemResType | null>();

  const playModal = useDisclosure(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: getMovieTypeLabel(type),
      excludeFromQueryFilter: ['type', 'season', 'movieTitle'],
      defaultFilters: {
        movieId,
        parentId: movieItemId
      },
      notShowFromSearchParams: ['movieId', 'parentId']
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
        ),
        edit: (record: MovieItemResType, buttonProps?: Record<string, any>) => {
          if (
            !handlers.hasPermission({
              requiredPermissions: [apiConfig.movieItem.update.permissionCode]
            })
          )
            return null;

          return (
            <ToolTip
              title={`Cập nhật ${getMovieTypeLabel(type)}`}
              sideOffset={0}
            >
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMovieItem(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineEdit className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
      handlers.renderAddButton = () => {
        return (
          <HasPermission
            requiredPermissions={[apiConfig.movieItem.create.permissionCode]}
          >
            <Button variant={'primary'} onClick={handleAddMovieItem}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
    }
  });

  const handleAddMovieItem = () => {
    setMovieItem(null);
    movieItemModal.open();
  };

  const handleEditMovieItem = (record: MovieItemResType) => {
    setMovieItem(record);
    movieItemModal.open();
  };

  const handleOpenPlayModal = (movieItem: MovieItemResType) => {
    setSelectedVideo(movieItem.video);
    playModal.open();
  };

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieItemResType>({
    key: `${queryKey}-list`,
    objectName: getMovieTypeLabel(type),
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
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
      title: `Tiêu đề ${getMovieTypeLabel(type)}`,
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn('line-clamp-1 block truncate', {
            italic: record.kind === MOVIE_ITEM_KIND_TRAILER
          })}
          title={`${record.kind === MOVIE_ITEM_KIND_EPISODE ? `${record.label}. ` : ''}${value}`}
        >
          {record.kind === MOVIE_ITEM_KIND_EPISODE && `Tập ${record.label}. `}
          {record.kind === MOVIE_ITEM_KIND_TRAILER && `${record.label}: `}
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
      title: 'Loại',
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
    { key: 'title', placeholder: `Tiêu đề ${getMovieTypeLabel(type)}` },
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

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        {
          label: searchParams.movieTitle ?? 'Mùa',
          href: renderListPageUrl(
            generatePath(route.movieItem.getList.path, {
              id: movieId
            }),
            serializeParams({
              type: searchParams.type,
              movieTitle: searchParams.movieTitle
            })
          )
        },
        {
          label: searchParams.season ?? 'Chi tiết'
        }
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
        />
      </ListPageWrapper>
      {movieItem && (
        <MovieItemModal
          open={movieItemModal.opened}
          close={movieItemModal.close}
          movieItem={movieItem}
        />
      )}
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

const getMovieTypeLabel = (type?: number | string) => {
  switch (Number(type)) {
    case MOVIE_TYPE_SINGLE:
      return 'trailer';
    case MOVIE_TYPE_SERIES:
      return 'tập, trailer';
    default:
      return 'mục phim';
  }
};
