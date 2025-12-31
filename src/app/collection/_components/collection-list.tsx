'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  COLLECTION_TYPE_SECTION,
  collectionTypeOptions,
  FieldTypes,
  MAX_PAGE_SIZE
} from '@/constants';
import { useDragDrop, useListBase, useNavigate, useQueryParams } from '@/hooks';
import { logger } from '@/logger';
import { route } from '@/routes';
import { collectionSearchSchema } from '@/schemaValidations';
import {
  CollectionResType,
  CollectionSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { Save } from 'lucide-react';
import { TbListDetails } from 'react-icons/tb';

export default function CollectionList({ queryKey }: { queryKey: string }) {
  const navigate = useNavigate(false);

  const {
    searchParams: { type }
  } = useQueryParams<CollectionSearchType>();

  const { data, loading, handlers, queryString } = useListBase<
    CollectionResType,
    CollectionSearchType
  >({
    apiConfig: apiConfig.collection,
    options: {
      queryKey,
      objectName: 'bộ sưu tập'
      // defaultFilters: {
      //   type: COLLECTION_TYPE_TOPIC
      // }
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
                      renderListPageUrl(
                        generatePath(route.collectionItem.getList.path, {
                          id: record.id
                        }),
                        queryString
                      )
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
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
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
    ...(type && +type === COLLECTION_TYPE_SECTION
      ? [
          {
            title: 'Thiết kế',
            dataIndex: ['style', 'name'],
            render: (value: string) => {
              return (
                <span title={value} className='line-clamp-1 block truncate'>
                  {value || '------'}
                </span>
              );
            },
            width: 300,
            align: 'center' as const
          }
        ]
      : []),
    {
      title: 'Màu',
      dataIndex: 'color',
      render: (value) => {
        let colors: string[] = [];

        try {
          if (typeof value === 'string') {
            colors = JSON.parse(value);
          } else if (Array.isArray(value)) {
            colors = value;
          } else {
            colors = [value];
          }
        } catch (error: any) {
          colors = [value];
          logger.error('Error while parsing color', error);
        }

        if (!Array.isArray(colors)) {
          colors = [colors];
        }

        colors = colors.filter(Boolean);

        if (colors.length === 0) {
          return null;
        }

        if (colors.length === 1) {
          return (
            <ToolTip title={colors[0]}>
              <div
                className='h-4 w-full rounded'
                style={{ background: colors[0] }}
              ></div>
            </ToolTip>
          );
        }

        const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

        return (
          <div className='flex flex-col gap-1'>
            <div
              className='h-4 w-full rounded'
              style={{ background: gradient }}
            ></div>
            <div className='flex gap-1'>
              {colors.map((color, index) => (
                <ToolTip title={color} key={index}>
                  <div
                    className='h-2 w-5 rounded-sm'
                    style={{ background: color }}
                    title={color}
                  ></div>
                </ToolTip>
              ))}
            </div>
          </div>
        );
      },
      width: 250,
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
      actions: { detail: true, edit: true, delete: true },
      columnProps: {
        fixed: true
      }
    })
  ];

  const searchFields: SearchFormProps<CollectionSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên bộ sưu tập' },
    { key: 'style', placeholder: 'Thiết kế' },
    {
      key: 'type',
      placeholder: 'Loại',
      options: collectionTypeOptions,
      type: FieldTypes.SELECT,
      submitOnChanged: true
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
    </PageWrapper>
  );
}
