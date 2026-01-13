'use client';

import VideoPlayModal from './video-play-modal';
import MovieItemModal from './movie-item-modal';
import { Button, ImageField, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  DEFAULT_DATE_FORMAT,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SINGLE,
  movieItemKindOptions
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import { movieItemSearchSchema } from '@/schemaValidations';
import type {
  Column,
  MovieItemResType,
  MovieItemSearchType,
  SearchFormProps,
  VideoLibraryResType
} from '@/types';
import {
  formatDate,
  generatePath,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { PlayCircle, PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export default function MovieItemSeasonList({
  queryKey
}: {
  queryKey: string;
}) {
  const navigate = useNavigate();
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams, serializeParams } = useQueryParams<{
    type: string;
    movieTitle: string;
  }>();

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
      objectName: 'mùa',
      excludeFromQueryFilter: ['type', 'movieTitle'],
      defaultFilters: {
        movieId,
        kind: MOVIE_ITEM_KIND_SEASON
      },
      notShowFromSearchParams: ['movieId', 'kind']
    },
    override: (handlers) => {
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
            <ToolTip title={`Cập nhật tập, trailer`} sideOffset={0}>
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
    objectName: 'mùa',
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
      title: 'Tiêu đề mùa',
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn('line-clamp-1 block truncate uppercase')}
          title={`${record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}: ${value}`}`}
        >
          <span className='font-bold'>
            {record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}:`}
          </span>
          &nbsp;
          <span>{value}</span>
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
          !!record.video &&
          !!searchParams.type &&
          +searchParams.type === MOVIE_TYPE_SINGLE,
        edit: true,
        delete: true
      },
      columnProps: {
        fixed: true
      }
    })
  ];

  const searchFields: SearchFormProps<MovieItemSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tiêu đề mùa' }
  ];

  const handleViewDetail = (record: MovieItemResType) => {
    navigate(
      renderListPageUrl(
        generatePath(route.movieItem.getDetailList.path, {
          id: movieId,
          parentId: record.id
        }),
        serializeParams({
          type: searchParams.type,
          movieTitle: searchParams.movieTitle,
          season: record.title
        })
      )
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: searchParams.movieTitle ?? 'Mùa' }
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
          onSelectRow={handleViewDetail}
          rowClassName={() => 'cursor-pointer'}
        />
      </ListPageWrapper>
      <MovieItemModal
        open={movieItemModal.opened}
        close={movieItemModal.close}
        movieItem={movieItem}
      />
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
