'use client';

import { emptyData } from '@/assets';
import MovieItemModal from './movie-item-modal';
import { Button, ImageField, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  apiConfig,
  DEFAULT_DATE_FORMAT,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_EPISODE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_ITEM_KIND_TRAILER
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useQueryParams,
  useValidatePermission
} from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import {
  MovieItemResType,
  MovieItemSearchType,
  VideoLibraryResType
} from '@/types';
import {
  formatDate,
  generatePath,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  useSortable
} from '@dnd-kit/sortable';
import { Grip, Info, PlayCircle, PlusIcon, Save } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CSSProperties, FC, useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { CSS } from '@dnd-kit/utilities';
import VideoPlayModal from './video-play-modal';

const MovieCard: FC<{
  item: MovieItemResType;
  onEdit: (item: MovieItemResType) => void;
  onDelete: (id: string) => void;
  onPlayVideo: (movieItem: MovieItemResType) => void;
  dragHandleProps?: any;
  showDragHandle?: boolean;
  isDragging?: boolean;
}> = ({
  item,
  onEdit,
  onDelete,
  onPlayVideo,
  dragHandleProps,
  showDragHandle = true,
  isDragging
}) => {
  const { hasPermission } = useValidatePermission();

  const canEdit = hasPermission({
    requiredPermissions: [apiConfig.movieItem.update.permissionCode]
  });

  const canDelete = hasPermission({
    requiredPermissions: [apiConfig.movieItem.delete.permissionCode]
  });

  const titleText =
    `${item.kind === MOVIE_ITEM_KIND_EPISODE ? `${item.label}. ` : ''}` +
    `${item.kind === MOVIE_ITEM_KIND_TRAILER ? `${item.label} ` : ''}` +
    item.title;

  return (
    <div
      className={cn(
        'group relative rounded shadow-[0px_0px_10px_2px] shadow-gray-300',
        {
          'scale-[1.01] shadow-[0px_0px_10px_5px] transition-all duration-75 ease-linear':
            isDragging
        }
      )}
    >
      {showDragHandle && dragHandleProps && (
        <div
          {...dragHandleProps}
          className={cn(
            'absolute -top-10 right-1/2 z-10 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded bg-white/90 shadow-[0px_0px_10px_2px] shadow-gray-300 transition-opacity duration-200 hover:bg-white active:cursor-move',
            {
              'cursor-move opacity-100': !dragHandleProps, // Overlay
              'cursor-move opacity-0 group-hover:opacity-100': !!dragHandleProps // Normal card
            }
          )}
        >
          <Grip size={16} className='text-gray-600' />
        </div>
      )}

      <ImageField
        src={renderImageUrl(item.thumbnailUrl)}
        className='border-none *:data-radix-aspect-ratio-wrapper:pb-0!'
        height={200}
      />

      <div className='p-4'>
        <h4
          className={cn('line-clamp-1 block truncate font-bold uppercase')}
          title={titleText}
        >
          {titleText}
        </h4>

        <div className='flex justify-between'>
          <span className={cn('')}>
            Ngày phát hành:&nbsp;
            {formatDate(item.releaseDate, DEFAULT_DATE_FORMAT)}
          </span>
          <span className='italic'>
            {item.kind === MOVIE_ITEM_KIND_EPISODE && `Tập`}
            {item.kind === MOVIE_ITEM_KIND_TRAILER && `Trailer`}
          </span>
        </div>
        <div className='-mr-2 flex items-center justify-end'>
          <ToolTip title={`Xem video`} sideOffset={0}>
            <span>
              <Button
                onClick={() => {
                  onPlayVideo(item);
                }}
                className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                disabled={!item.video || !item.video.duration}
              >
                <PlayCircle className='text-dodger-blue size-4' />
              </Button>
            </span>
          </ToolTip>

          {canEdit && (
            <Separator
              orientation='vertical'
              className='h-4! w-px bg-gray-200'
            />
          )}

          {canEdit && (
            <ToolTip title='Cập nhật' sideOffset={0}>
              <Button
                variant={'ghost'}
                className='px-2!'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <AiOutlineEdit className='text-dodger-blue' />
              </Button>
            </ToolTip>
          )}

          {canDelete && (
            <Separator
              orientation='vertical'
              className='h-4! w-px bg-gray-200'
            />
          )}

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span>
                  <ToolTip title={`Xóa`} sideOffset={0}>
                    <Button className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'>
                      <AiOutlineDelete className='text-destructive size-4' />
                    </Button>
                  </ToolTip>
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-top-0! top-[30%] max-w-md p-4'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='content flex flex-nowrap items-center gap-2 text-sm font-normal'>
                    <Info className='size-8 fill-orange-500 stroke-white' />
                    Bạn có chắc chắn muốn xóa tập/trailer này không ?
                  </AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      variant='outline'
                      className='w-20 border-red-500 text-red-500 transition-all duration-200 ease-linear hover:bg-transparent hover:text-red-500/80'
                    >
                      Không
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className='bg-dodger-blue hover:bg-dodger-blue/80 w-20 cursor-pointer transition-all duration-200 ease-linear'
                  >
                    Có
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

const MovieCardSkeleton = () => {
  return (
    <div className='rounded shadow-[0px_0px_10px_2px] shadow-gray-300'>
      <div className='skeleton h-50 w-full rounded!'></div>

      <div className='p-4'>
        <h4
          className={cn(
            'skeleton mb-2 h-5 w-20 font-bold uppercase select-none'
          )}
        ></h4>
        <span className={cn('skeleton block h-5 w-20 select-none')}></span>
        <div className='-mr-2 flex items-center justify-end gap-2'>
          <div className='skeleton h-8 w-8'></div>
          <Separator orientation='vertical' className='h-4! w-px bg-gray-200' />
          <div className='skeleton h-8 w-8'></div>
          <Separator orientation='vertical' className='h-4! w-px bg-gray-200' />
          <div className='skeleton h-8 w-8'></div>
        </div>
      </div>
    </div>
  );
};

const SortableMovieCard: FC<{
  item: MovieItemResType;
  onEdit: (item: MovieItemResType) => void;
  onDelete: (id: string) => void;
  onPlayVideo: (movieItem: MovieItemResType) => void;
}> = ({ item, onEdit, onDelete, onPlayVideo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <MovieCard
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onPlayVideo={onPlayVideo}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

export default function MovieItemSeasonDetailList({
  queryKey
}: {
  queryKey: string;
}) {
  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();

  const movieItemModal = useDisclosure(false);
  const [movieItem, setMovieItem] = useState<MovieItemResType | null>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { searchParams, serializeParams } = useQueryParams<{
    type: string;
    season: string;
  }>();

  const playModal = useDisclosure(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryResType>();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: 'tập/trailer',
      excludeFromQueryFilter: ['type', 'season'],
      defaultHiddenFilters: {
        movieId,
        parentId: movieItemId
      }
    },
    override: (handlers) => {
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE,
        excludeKind: MOVIE_ITEM_KIND_SEASON
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
    loading: loadingUpdateOrdering,
    sortedData,
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<MovieItemResType>({
    key: `${queryKey}-list`,
    objectName: 'tập/trailer',
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering',
    mappingData: (record, index) => ({
      id: record.id,
      ordering: index,
      parentId: record?.parent?.id
    })
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 20,
        tolerance: 5
      }
    })
  );

  const activeItem = activeId
    ? sortedData.find((item) => item.id === activeId)
    : null;

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        {
          label: 'Mùa',
          href: renderListPageUrl(
            generatePath(route.movieItem.getList.path, {
              id: movieId
            }),
            serializeParams({ type: searchParams.type })
          )
        },
        {
          label: searchParams.season ?? 'Chi tiết'
        }
      ]}
    >
      <ListPageWrapper
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(event) => {
            setActiveId(event.active.id as string);
          }}
          onDragEnd={(event) => {
            setActiveId(null);
            onDragEnd(event);
          }}
          onDragCancel={() => {
            setActiveId(null);
          }}
        >
          <SortableContext
            items={sortedData.map((r) => r.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className={cn({
                'grid grid-cols-4 gap-4 px-4 max-[1537px]:grid-cols-3':
                  sortedData.length
              })}
            >
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))
              ) : sortedData.length === 0 && !loading ? (
                <div className='flex flex-col items-center justify-center'>
                  <Image
                    src={emptyData.src}
                    alt='Không có dữ liệu'
                    width={150}
                    height={50}
                  />
                  <span>Không có dữ liệu</span>
                </div>
              ) : (
                sortedData.map((item) => (
                  <SortableMovieCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditMovieItem}
                    onDelete={handlers.handleDeleteClick}
                    onPlayVideo={handleOpenPlayModal}
                  />
                ))
              )}
            </div>
          </SortableContext>
          <DragOverlay adjustScale style={{ transformOrigin: '0 0' }}>
            {activeItem ? (
              <div style={{ cursor: 'move' }}>
                <MovieCard
                  item={activeItem}
                  onEdit={handleEditMovieItem}
                  onDelete={handlers.handleDeleteClick}
                  onPlayVideo={handleOpenPlayModal}
                  showDragHandle={true}
                  dragHandleProps={{}}
                  isDragging={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
      <MovieItemModal
        open={movieItemModal.opened}
        close={movieItemModal.close}
        movieItem={movieItem}
      />
      <VideoPlayModal
        open={playModal.opened}
        close={playModal.close}
        video={selectedVideo}
      />
    </PageWrapper>
  );
}
