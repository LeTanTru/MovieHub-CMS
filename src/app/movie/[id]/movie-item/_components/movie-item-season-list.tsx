'use client';

import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import {
  apiConfig,
  DEFAULT_DATE_FORMAT,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_SEASON
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useNavigate,
  useQueryParams,
  useValidatePermission
} from '@/hooks';
import { route } from '@/routes';
import { MovieItemResType, MovieItemSearchType } from '@/types';
import {
  formatDate,
  generatePath,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { Info, PlusIcon, Save, Grip } from 'lucide-react';
import { useParams } from 'next/navigation';
import { CSSProperties, FC, useState } from 'react';
import MovieItemModal from './movie-item-modal';
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai';
import { Separator } from '@/components/ui/separator';
import { HasPermission } from '@/components/has-permission';
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
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib';
import Image from 'next/image';
import { emptyData } from '@/assets';

const MovieCard: FC<{
  item: MovieItemResType;
  onViewDetail: (item: MovieItemResType) => void;
  onEdit: (item: MovieItemResType) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: any;
  showDragHandle?: boolean;
  isDragging?: boolean;
}> = ({
  item,
  onViewDetail,
  onEdit,
  onDelete,
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
          title={`Mùa ${item.label}: ${item.title}`}
        >
          Mùa {item.label}:&nbsp;{item.title}
        </h4>
        <span className={cn('')}>
          Ngày phát hành:&nbsp;
          {formatDate(item.releaseDate, DEFAULT_DATE_FORMAT)}
        </span>
        <div className='-mr-2 flex items-center justify-end'>
          <ToolTip title='Xem chi tiết' sideOffset={0}>
            <Button
              variant={'ghost'}
              className='px-2!'
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(item);
              }}
            >
              <AiOutlineEye className='text-dodger-blue' />
            </Button>
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
                    Bạn có chắc chắn muốn xóa mùa này không ?
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
  onViewDetail: (item: MovieItemResType) => void;
  onEdit: (item: MovieItemResType) => void;
  onDelete: (id: string) => void;
}> = ({ item, onViewDetail, onEdit, onDelete }) => {
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
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

export default function MovieItemSeasonList({
  queryKey
}: {
  queryKey: string;
}) {
  const navigate = useNavigate();
  const { id: movieId } = useParams<{
    id: string;
  }>();

  const movieItemModal = useDisclosure(false);
  const [movieItem, setMovieItem] = useState<MovieItemResType | null>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { searchParams, serializeParams } = useQueryParams<{ type: string }>();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: 'mùa',
      excludeFromQueryFilter: ['type'],
      defaultHiddenFilters: {
        movieId
      }
    },
    override: (handlers) => {
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE,
        kind: MOVIE_ITEM_KIND_SEASON
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

  const {
    loading: loadingUpdateOrdering,
    sortedData,
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<MovieItemResType>({
    key: `${queryKey}-list`,
    objectName: 'mùa',
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering'
  });

  const handleViewDetail = (record: MovieItemResType) => {
    navigate(
      renderListPageUrl(
        generatePath(route.movieItem.getDetailList.path, {
          id: movieId,
          parentId: record.id
        }),
        serializeParams({ type: searchParams.type, season: record.title })
      )
    );
  };

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
        { label: 'Mùa' }
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
              ) : sortedData.length === 0 ? (
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
                    onViewDetail={handleViewDetail}
                    onEdit={handleEditMovieItem}
                    onDelete={handlers.handleDeleteClick}
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
                  onViewDetail={handleViewDetail}
                  onEdit={handleEditMovieItem}
                  onDelete={handlers.handleDeleteClick}
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
    </PageWrapper>
  );
}
