'use client';

import { ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import { apiConfig, DEFAULT_DATE_FORMAT, FieldTypes } from '@/constants';
import { useDragDrop, useListBase } from '@/hooks';
import { cn } from '@/lib';
import { movieSidebarSearchSchema } from '@/schemaValidations';
import type {
  Column,
  MovieSidebarResType,
  MovieSidebarSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, renderImageUrl } from '@/utils';

export default function SidebarList({ queryKey }: { queryKey: string }) {
  const { data, loading, handlers } = useListBase<
    MovieSidebarResType,
    MovieSidebarSearchType
  >({
    apiConfig: apiConfig.sidebar,
    options: {
      queryKey,
      objectName: 'phim'
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieSidebarResType>({
    key: `${queryKey}-list`,
    objectName: 'phim',
    data,
    apiConfig: apiConfig.sidebar.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<MovieSidebarResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: 'webThumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <ImageField disablePreview={!value} src={renderImageUrl(value)} />
      )
    },
    {
      title: '#',
      dataIndex: 'mobileThumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          previewAspect={2 / 3}
        />
      )
    },
    {
      title: 'Phim',
      dataIndex: ['movie', 'title'],
      render: (value) => (
        <span className='line-clamp-1 block truncate'>{value}</span>
      )
    },
    {
      title: 'Ngày phát hành',
      dataIndex: ['movie', 'releaseDate'],
      render: (_, record) => (
        <span className='line-clamp-1 block truncate'>
          {formatDate(record.movie.releaseDate, DEFAULT_DATE_FORMAT)}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Màu chủ đạo',
      dataIndex: ['mainColor'],
      render: (value) => (
        <ToolTip title={value}>
          <div
            className='mx-auto h-4 w-20 rounded'
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
        <div className='flex items-center justify-center gap-2'>
          <span
            className={cn('rounded-md px-2 py-0.5 text-sm', {
              'bg-red-100 text-red-600': !record.active,
              'bg-green-100 text-green-600': record.active
            })}
          >
            {record.active ? 'Hiện' : 'Ẩn'}
          </span>
        </div>
      ),
      width: 100,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        person: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.moviePerson.getList.permissionCode as string
          ]
        }),
        edit: true,
        delete: true
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
    <PageWrapper breadcrumbs={[{ label: 'Phim nổi bật' }]}>
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
          loading={loading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
        />
      </ListPageWrapper>
    </PageWrapper>
  );

  return <div></div>;
}
