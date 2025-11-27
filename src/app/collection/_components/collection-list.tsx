'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { DragDropTable } from '@/components/table';
import { apiConfig, collectionTypeOptions, FieldTypes } from '@/constants';
import { useDragDrop, useListBase, useNavigate } from '@/hooks';
import { route } from '@/routes';
import { collectionSearchSchema } from '@/schemaValidations';
import {
  CollectionResType,
  CollectionSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { generatePath } from '@/utils';
import { Save } from 'lucide-react';
import { TbListDetails } from 'react-icons/tb';

export default function CollectionList({ queryKey }: { queryKey: string }) {
  const navigate = useNavigate(false);

  const { data, loading, handlers } = useListBase<
    CollectionResType,
    CollectionSearchType
  >({
    apiConfig: apiConfig.collection,
    options: {
      queryKey,
      objectName: 'bộ sưu tập'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        detail: (
          record: CollectionResType,
          buttonProps: Record<string, any>
        ) => {
          if (
            !handlers.hasPermission({
              requiredPermissions: [
                apiConfig.collectionItem.getList.permissionCode
              ]
            })
          )
            return null;

          return (
            <ToolTip title={`Chi tiết bộ sưu tập`} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      generatePath(route.collectionItem.getList.path, {
                        id: record.id
                      })
                    );
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <TbListDetails className='text-dodger-blue size-4' />
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
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<CollectionResType>({
    key: `${queryKey}-list`,
    objectName: 'bộ sưu tập',
    data,
    apiConfig: apiConfig.collection.updateOrdering,
    sortField: 'ordering'
  });

  const columns: Column<CollectionResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate'>{value}</span>
      )
    },
    {
      title: 'Thiết kế',
      dataIndex: ['style', 'name'],
      render: (value) => {
        return <span className='line-clamp-1 block truncate'>{value}</span>;
      },
      width: 120,
      align: 'center'
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      render: (value) => {
        return (
          <ToolTip title={value}>
            <div
              className='h-4 w-full rounded'
              style={{ background: value }}
            ></div>
          </ToolTip>
        );
      },
      width: 120,
      align: 'center'
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (value) => {
        const label = collectionTypeOptions.find(
          (opt) => opt.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate'>
            {label ?? '------'}
          </span>
        );
      },
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: { detail: true, edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<CollectionSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên bộ sưu tập' },
    { key: 'style', placeholder: 'Thiết kế' },
    {
      key: 'type',
      placeholder: 'Loại',
      options: collectionTypeOptions,
      type: FieldTypes.SELECT
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Bộ sưu tập' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: collectionSearchSchema
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
}
