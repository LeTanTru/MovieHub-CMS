'use client';

import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { apiConfig, FieldTypes, objectNames, queryKeys } from '@/constants';
import { useDragDrop, useListBase } from '@/hooks';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { useChangeActiveSidebarMutation } from '@/queries';
import { movieSidebarSearchSchema } from '@/schemaValidations';
import type {
  Column,
  MovieSidebarResType,
  MovieSidebarSearchType,
  SearchFormProps
} from '@/types';
import { convertUTCToLocal, notify, renderImageUrl } from '@/utils';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export const SidebarList = () => {
  const { mutateAsync: changeStatusMutate, isPending: changeStatusPending } =
    useChangeActiveSidebarMutation();

  const { data, loading, handlers } = useListBase<
    MovieSidebarResType,
    MovieSidebarSearchType
  >({
    apiConfig: apiConfig.sidebar,
    options: {
      queryKey: queryKeys.SIDEBAR,
      objectName: objectNames.SIDEBAR
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: MovieSidebarResType,
          buttonProps?: Record<string, any>
        ) => {
          const statusLabel = record.active ? 'Ẩn' : 'Hiện';

          const handleChangeStatus = async () => {
            await changeStatusMutate(
              {
                id: record.id,
                active: !record.active
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success(`${statusLabel} phim thành công`);
                    handlers.invalidateQueries();
                  } else {
                    notify.error(`${statusLabel} phim thất bại`);
                  }
                },
                onError: (error) => {
                  logger.error('[CHANGE_STATUS_ERROR]', error);
                  notify.error(`${statusLabel} phim thất bại`);
                }
              }
            );
          };

          const Icon = record.active ? AiOutlineEyeInvisible : AiOutlineEye;

          return (
            <ToolTip title={statusLabel} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeStatus();
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <Icon
                    className={cn('size-4', {
                      'text-main-color': !record.active,
                      'text-destructive': record.active
                    })}
                  />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieSidebarResType>({
    key: queryKeys.SIDEBAR_LIST,
    objectName: objectNames.SIDEBAR,
    data,
    apiConfig: apiConfig.sidebar.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<MovieSidebarResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [apiConfig.sidebar.updateOrdering.permissionCode]
    })
      ? [sortColumn]
      : []),
    {
      title: '#',
      dataIndex: 'webThumbnailUrl',
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
      title: '#',
      dataIndex: 'mobileThumbnailUrl',
      width: 64,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          aspect={2 / 3}
          previewAspect={2 / 3}
        />
      )
    },
    {
      title: 'Phim',
      dataIndex: ['movie', 'title'],
      render: (value, record) => (
        <>
          <span title={value} className='line-clamp-1 block truncate'>
            {value}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={record.movie.originalTitle}
          >
            {record.movie.originalTitle}
          </span>
        </>
      )
    },
    {
      title: 'Ngày phát hành',
      dataIndex: ['movie', 'releaseDate'],
      render: (_, record) => (
        <span className='line-clamp-1 block truncate'>
          {convertUTCToLocal(record.movie.releaseDate) || 'N/A'}
        </span>
      ),
      width: 250,
      align: 'center'
    },
    {
      title: 'Màu chủ đạo',
      dataIndex: ['mainColor'],
      render: (value) => (
        <ToolTip title={value}>
          <div
            className='mx-auto h-6 w-20 rounded'
            style={{ background: value }}
          ></div>
        </ToolTip>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <Badge
          variant='outline'
          className={cn('text-sm font-normal', {
            'border-emerald-400 bg-emerald-100 text-emerald-600': record.active,
            'border-rose-400 bg-rose-100 text-rose-600': !record.active
          })}
        >
          {record.active ? 'Hiện' : 'Ẩn'}
        </Badge>
      ),
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.sidebar.update.permissionCode]
        }),
        changeStatus: handlers.hasPermission({
          requiredPermissions: [apiConfig.sidebar.changeActive.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.sidebar.delete.permissionCode]
        })
      },
      columnProps: {
        width: 150
      }
    })
  ];

  const searchFields: SearchFormProps<MovieSidebarSearchType>['searchFields'] =
    [
      {
        key: 'active',
        placeholder: 'Hiện',
        type: FieldTypes.BOOLEAN
      }
    ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Phim hot' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: movieSidebarSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={loading || loadingUpdateOrdering || changeStatusPending}
          onDragEnd={onDragEnd}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
};
