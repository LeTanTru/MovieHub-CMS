'use client';

import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
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
  queryKeys
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
import type {
  Column,
  MovieItemResType,
  MovieItemSearchType,
  SearchFormProps,
  VideoLibraryResType
} from '@/types';
import {
  convertUTCToLocal,
  formatSecondsToHMS,
  generatePath,
  notify,
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
import { Badge } from '@/components/ui/badge';
import { useMarkLatestMovieItemMutation } from '@/queries';
import { IoCheckmarkDone } from 'react-icons/io5';
import { logger } from '@/logger';

export default function MovieItemSeasonDetailList() {
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

  const {
    opened: openedMovieItemModal,
    open: openMovieItemModal,
    close: closeMovieItemModal
  } = useDisclosure();
  const [movieItem, setMovieItem] = useState<MovieItemResType | null>();

  const {
    opened: openedPlayModal,
    open: openPlayModal,
    close: closePlayModal
  } = useDisclosure();
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { mutateAsync: markLatestMutate, isPending: markLatestPending } =
    useMarkLatestMovieItemMutation();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey: queryKeys.MOVIE_ITEM,
      objectName: getMovieTypeLabel(type),
      excludeFromQueryFilter: ['type', 'season', 'movieTitle'],
      defaultFilters: {
        movieId,
        parentId: movieItemId
      },
      notShowFromSearchParams: ['movieId', 'parentId']
    },
    override: (handlers) => {
      handlers.additionalColumns = () => {
        const handleOpenPlayModal = (movieItem: MovieItemResType) => {
          setSelectedVideo(movieItem.video);
          openPlayModal();
        };

        return {
          watchVideo: (
            record: MovieItemResType,
            buttonProps?: Record<string, any>
          ) => (
            <ToolTip title='Xem video' sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPlayModal(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  disabled={!record.video || !record.video.duration}
                  variant='ghost'
                  {...buttonProps}
                >
                  <PlayCircle className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          ),
          edit: (
            record: MovieItemResType,
            buttonProps?: Record<string, any>
          ) => {
            const handleEditMovieItem = (record: MovieItemResType) => {
              setMovieItem(record);
              openMovieItemModal();
            };

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
                    <AiOutlineEdit className='text-main-color size-4' />
                  </Button>
                </span>
              </ToolTip>
            );
          },
          markLatest: (
            record: MovieItemResType,
            buttonProps?: Record<string, any>
          ) => {
            const handleMarkLatest = (record: MovieItemResType) => {
              markLatestMutate(record.id, {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success(
                      `Đánh dấu phần "${record.label}" là phần mới nhất thành công`
                    );
                    handlers.invalidateQueries();
                  }
                },
                onError: (error) => {
                  logger.error('Error while mark latest movie item', error);
                  notify.error(
                    `Đánh dấu phần "${record.label}" là phần mới nhất thất bại`
                  );
                }
              });
            };

            return (
              <ToolTip
                title={`Đánh dấu phần ${record.label} là mới nhất`}
                sideOffset={0}
              >
                <span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkLatest(record);
                    }}
                    className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                    {...buttonProps}
                  >
                    <IoCheckmarkDone className='text-main-color size-4' />
                  </Button>
                </span>
              </ToolTip>
            );
          }
        };
      };
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
      handlers.renderAddButton = () => {
        const handleAddMovieItem = () => {
          setMovieItem(null);
          openMovieItemModal();
        };
        return (
          <HasPermission
            requiredPermissions={[apiConfig.movieItem.create.permissionCode]}
          >
            <Button variant='primary' onClick={handleAddMovieItem}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieItemResType>({
    key: `${queryKeys.MOVIE_ITEM}-list`,
    objectName: getMovieTypeLabel(type),
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<MovieItemResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [apiConfig.movieItem.updateOrdering.permissionCode]
    })
      ? [sortColumn]
      : []),
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
          <span className='ml-2'>
            {record.isLatest && (
              <Badge
                variant='outline'
                className='border-emerald-500 bg-emerald-50 text-emerald-500'
              >
                Mới nhất
              </Badge>
            )}
          </span>
        </span>
      )
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'releaseDate',
      width: 250,
      render: (value) => convertUTCToLocal(value),
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
        markLatest: (record) =>
          record.kind === MOVIE_ITEM_KIND_EPISODE &&
          !record.isLatest &&
          handlers.hasPermission({
            requiredPermissions: [apiConfig.movieItem.markLatest.permissionCode]
          }),
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.movieItem.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.movieItem.delete.permissionCode]
        })
      },
      columnProps: {
        width: 150
      }
    })
  ];

  const kindOptions =
    !!type && +type === MOVIE_TYPE_SINGLE
      ? movieItemSingleKindOptions.filter(
          (item) =>
            !movieItemId ||
            (movieItemId && item.value !== MOVIE_ITEM_KIND_SEASON)
        )
      : movieItemSeriesKindOptions.filter(
          (item) =>
            !movieItemId ||
            (movieItemId && item.value !== MOVIE_ITEM_KIND_SEASON)
        );

  const searchFields: SearchFormProps<MovieItemSearchType>['searchFields'] = [
    { key: 'title', placeholder: `Tiêu đề ${getMovieTypeLabel(type)}` },
    ...(kindOptions.length > 0
      ? [
          {
            key: 'kind' as const,
            placeholder: 'Loại',
            type: FieldTypes.SELECT,
            options: kindOptions
          }
        ]
      : [])
  ];

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        {
          label: searchParams.movieTitle ?? 'Phần',
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
          loading={loading || loadingUpdateOrdering || markLatestPending}
          onDragEnd={onDragEnd}
        />
      </ListPageWrapper>
      <MovieItemModal
        open={openedMovieItemModal}
        onClose={closeMovieItemModal}
        movieItem={movieItem}
      />
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
