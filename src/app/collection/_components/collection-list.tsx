'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  COLLECTION_TYPE_SECTION,
  COLLECTION_TYPE_TOPIC,
  collectionTypeOptions,
  FieldTypes,
  MAX_PAGE_SIZE,
  queryKeys
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { logger } from '@/logger';
import { route } from '@/routes';
import { collectionSearchSchema } from '@/schemaValidations';
import type {
  CollectionResType,
  CollectionSearchType,
  Column,
  SearchFormProps,
  StyleResType
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { TbListDetails, TbPalette } from 'react-icons/tb';
import { useState } from 'react';
import StyleInfoModal from './style-info-modal';

export default function CollectionList() {
  const navigate = useNavigate(false);
  const { opened, open, close } = useDisclosure();
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionResType | null>(null);

  const { searchParams, serializeParams } =
    useQueryParams<CollectionSearchType>();

  const type = searchParams.type;

  const { data, loading, handlers } = useListBase<
    CollectionResType,
    CollectionSearchType
  >({
    apiConfig: apiConfig.collection,
    options: {
      queryKey: queryKeys.COLLECTION,
      objectName: 'bộ sưu tập',
      defaultFilters: {
        type: COLLECTION_TYPE_TOPIC
      }
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        detail: (
          record: CollectionResType,
          buttonProps: Record<string, any>
        ) => {
          const handleNavigate = () => {
            navigate.push(
              renderListPageUrl(
                generatePath(route.collectionItem.getList.path, {
                  id: record.id
                }),
                serializeParams({
                  type: searchParams.type,
                  collectionTitle: record.name
                })
              )
            );
          };

          return (
            <ToolTip title='Phim' sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <TbListDetails className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },
        styleInfo: (
          record: CollectionResType,
          buttonProps: Record<string, any>
        ) => {
          if (
            !(
              searchParams.type &&
              +searchParams.type === COLLECTION_TYPE_SECTION
            )
          )
            return null;

          return (
            <ToolTip title='Xem thiết kế' sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCollection(record);
                    open();
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <TbPalette className='text-main-color size-4' />
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
    onDragEnd
  } = useDragDrop<CollectionResType>({
    key: queryKeys.COLLECTION_LIST,
    objectName: 'bộ sưu tập',
    data,
    apiConfig: apiConfig.collection.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<CollectionResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [apiConfig.collection.updateOrdering.permissionCode]
    })
      ? [sortColumn]
      : []),
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => <span className='whitespace-nowrap'>{value}</span>
    },
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
          logger.error('[PARSE_COLOR_ERROR]', error);
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
    handlers.renderActionColumn({
      actions: {
        styleInfo: true,
        detail: handlers.hasPermission({
          requiredPermissions: [apiConfig.collectionItem.getList.permissionCode]
        }),
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.collection.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.collection.delete.permissionCode]
        })
      },
      columnProps: {
        width: 150
      }
    })
  ];

  const searchFields: SearchFormProps<CollectionSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên bộ sưu tập' },
    {
      key: 'type',
      placeholder: 'Loại',
      options: collectionTypeOptions,
      type: FieldTypes.SELECT,
      submitOnChanged: true
    },
    ...(!!type && +type === COLLECTION_TYPE_SECTION
      ? [
          {
            key: 'styleId' as const,
            placeholder: 'Thiết kế',
            type: FieldTypes.AUTO_COMPLETE,
            apiConfig: apiConfig.style.autoComplete,
            mappingData: (item: StyleResType) => ({
              label: item.name,
              value: item.id.toString()
            }),
            searchParams: ['name']
          }
        ]
      : [])
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
      </ListPageWrapper>

      {selectedCollection && (
        <StyleInfoModal
          opened={opened}
          onClose={close}
          style={selectedCollection.style}
        />
      )}
    </PageWrapper>
  );
}
