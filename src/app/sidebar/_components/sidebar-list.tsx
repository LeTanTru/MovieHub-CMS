'use client';

import { AvatarField, Button } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { DragDropTable } from '@/components/table';
import { apiConfig, DEFAULT_DATE_FORMAT, FieldTypes } from '@/constants';
import { useDragDrop, useListBase } from '@/hooks';
import { cn } from '@/lib';
import { movieSidebarSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieSidebarResType,
  MovieSidebarSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, renderImageUrl } from '@/utils';
import { Save } from 'lucide-react';
import { AiOutlineFileImage } from 'react-icons/ai';

export default function SidebarList({ queryKey }: { queryKey: string }) {
  const { data, loading, handlers } = useListBase<
    MovieSidebarResType,
    MovieSidebarSearchType
  >({
    apiConfig: apiConfig.sidebar,
    options: {
      queryKey,
      objectName: 'phim mới'
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<MovieSidebarResType>({
    key: `${queryKey}-list`,
    objectName: 'mục phim',
    data,
    apiConfig: apiConfig.sidebar.updateOrdering,
    sortField: 'ordering'
  });

  const columns: Column<MovieSidebarResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: 'webThumbnailUrl',
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
      title: '#',
      dataIndex: 'mobileThumbnailUrl',
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
      title: 'Tiêu đề phim',
      dataIndex: ['movieItem', 'movie', 'title'],
      render: (value) => <span>{value}</span>
    },
    {
      title: 'Tập phim',
      dataIndex: ['movieItem', 'title'],
      render: (value, record) => (
        <span className='line-clamp-1 block truncate'>
          {record.movieItem.label}.&nbsp;{value}
        </span>
      ),
      width: 250
    },
    {
      title: 'Ngày phát hành',
      dataIndex: ['movieItem', 'releaseDate'],
      render: (value, record) => (
        <span className='line-clamp-1 block truncate'>
          {formatDate(record.movieItem.releaseDate, DEFAULT_DATE_FORMAT)}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Màu chủ đạo',
      dataIndex: ['mainColor'],
      render: (value) => (
        <div
          className='mx-auto h-4 w-20 rounded'
          style={{ background: value }}
        ></div>
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
    <PageWrapper breadcrumbs={[{ label: 'Phim mới' }]}>
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
    </PageWrapper>
  );

  return <div></div>;
}
