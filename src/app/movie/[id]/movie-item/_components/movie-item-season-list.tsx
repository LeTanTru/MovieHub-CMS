'use client';

import VideoPlayModal from './video-play-modal';
import MovieItemModal from './movie-item-modal';
import { Button, ImageField, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SINGLE,
  movieItemKindOptions,
  queryKeys
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
  convertUTCToLocal,
  generatePath,
  notify,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { PlayCircle, PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { Badge } from '@/components/ui/badge';
import { IoCheckmarkDone } from 'react-icons/io5';
import { useMarkLatestMovieItemMutation } from '@/queries';
import { logger } from '@/logger';

export default function MovieItemSeasonList() {
  const navigate = useNavigate();
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams, serializeParams } = useQueryParams<{
    type: string;
    movieTitle: string;
  }>();

  const type = searchParams.type;
  const movieTitle = searchParams.movieTitle;

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
      objectName: 'phần',
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
      handlers.additionalColumns = () => {
        const handleOpenPlayModal = (record: MovieItemResType) => {
          setSelectedVideo(record.video);
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
              <ToolTip title={`Cập nhật phần ${record.label}`} sideOffset={0}>
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
                      `Đánh dấu "${record.label}" là phần mới nhất thành công`
                    );
                    handlers.invalidateQueries();
                  } else {
                    notify.error(
                      `Đánh dấu "${record.label}" là phần mới nhất thất bại`
                    );
                  }
                },
                onError: (error) => {
                  logger.error('[MARK_LATEST_MOVIE_ITEM_ERROR]', error);
                  notify.error(
                    `Đánh dấu "${record.label}" là phần mới nhất thất bại`
                  );
                }
              });
            };

            return (
              <ToolTip
                title={`Đánh dấu ${record.label} là mới nhất`}
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
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieItemResType>({
    key: queryKeys.MOVIE_ITEM_LIST,
    objectName: 'phần',
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
      title: 'Tiêu đề phần',
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn('line-clamp-1 block truncate uppercase')}
          title={`${record.kind === MOVIE_ITEM_KIND_SEASON && `Phần ${record.label}: ${value}`}`}
        >
          <span className='font-bold'>
            {record.kind === MOVIE_ITEM_KIND_SEASON && `Phần ${record.label}:`}
          </span>
          &nbsp;
          <span>{value}</span>
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
      render: (value) => convertUTCToLocal(value) || 'N/A',
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
        return label || 'N/A';
      },
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        watchVideo: (record) =>
          !!record.video && !!type && +type === MOVIE_TYPE_SINGLE,
        markLatest: (record) =>
          !record.isLatest &&
          !!type &&
          +type === MOVIE_TYPE_SINGLE &&
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

  const searchFields: SearchFormProps<MovieItemSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tiêu đề' }
  ];

  const handleViewDetail = (record: MovieItemResType) => {
    navigate.push(
      renderListPageUrl(
        generatePath(route.movieItem.getDetailList.path, {
          id: movieId,
          parentId: record.id
        }),
        serializeParams({
          type,
          movieTitle,
          season: record.title
        })
      )
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: searchParams.movieTitle || 'Phần' }
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
          onSelectRow={handleViewDetail}
          rowClassName={() => 'cursor-pointer'}
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
