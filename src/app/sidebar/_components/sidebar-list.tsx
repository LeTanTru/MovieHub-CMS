'use client';

import { AvatarField, Button } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { DragDropTable } from '@/components/table';
import { apiConfig, FieldTypes, movieSidebarStatusOptions } from '@/constants';
import { useDragDrop, useListBase } from '@/hooks';
import { cn } from '@/lib';
import { movieSidebarSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieSidebarResType,
  MovieSidebarSearchType,
  SearchFormProps
} from '@/types';
import { renderImageUrl } from '@/utils';
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
      objectName: 'phim'
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
      dataIndex: ['movie', 'movieItem', 'title'],
      render: (value) => <span>{value}</span>
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
        placeholder: 'Trạng thái',
        type: FieldTypes.SELECT,
        options: movieSidebarStatusOptions
      }
    ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Phim' }]}>
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
