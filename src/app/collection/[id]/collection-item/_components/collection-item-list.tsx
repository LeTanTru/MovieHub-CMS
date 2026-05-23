'use client';

import { CollectionItemModal } from './collection-item-modal';
import { Button, ImageField } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  DATE_FORMAT,
  languageOptions,
  movieTypeOptions,
  objectNames,
  queryKeys
} from '@/constants';
import {
  useDisclosure,
  useDragDrop,
  useListBase,
  useQueryParams
} from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import { collectionItemSearchSchema } from '@/schemaValidations';
import type {
  CollectionItemResType,
  CollectionItemSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { convertUTCToLocal, renderImageUrl, renderListPageUrl } from '@/utils';
import { PlusIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export function CollectionItemList() {
  const { id: collectionId } = useParams<{ id: string }>();

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { collectionTitle, ...restSearchParams } = parentParams;

  const { opened, open, close } = useDisclosure();

  const { data, loading, handlers } = useListBase<
    CollectionItemResType,
    CollectionItemSearchType
  >({
    apiConfig: apiConfig.collectionItem,
    options: {
      queryKey: queryKeys.COLLECTION_ITEM,
      objectName: objectNames.MOVIE,
      defaultFilters: { collectionId },
      notShowFromSearchParams: ['collectionId']
    },
    override: (handlers) => {
      handlers.renderAddButton = () => {
        const handleAddCollectionItem = () => {
          open();
        };

        return (
          <HasPermission
            requiredPermissions={[
              apiConfig.collectionItem.create.permissionCode
            ]}
          >
            <Button variant='primary' onClick={handleAddCollectionItem}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<CollectionItemResType>({
    key: queryKeys.COLLECTION_ITEM_LIST,
    objectName: objectNames.MOVIE,
    data,
    apiConfig: apiConfig.collectionItem.updateOrdering,
    sortField: 'ordering',
    mappingData: (record, index) => ({
      id: record.id,
      ordering: index,
      parentId: record.collectionId
    }),
    updateOnDragEnd: true
  });

  const columns: Column<CollectionItemResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [
        apiConfig.collectionItem.updateOrdering.permissionCode
      ]
    })
      ? [sortColumn]
      : []),
    {
      title: '#',
      dataIndex: ['movie', 'posterUrl'],
      width: 64,
      align: 'center',
      render: (value) => {
        return (
          <ImageField
            disablePreview={!value}
            src={renderImageUrl(value as string)}
            aspect={2 / 3}
            previewAspect={2 / 3}
          />
        );
      }
    },
    {
      title: '#',
      dataIndex: ['movie', 'thumbnailUrl'],
      width: 100,
      align: 'center',
      render: (value) => {
        return (
          <ImageField
            disablePreview={!value}
            src={renderImageUrl(value as string)}
            aspect={16 / 9}
            previewAspect={16 / 9}
          />
        );
      }
    },
    {
      title: 'Tiêu đề phim',
      dataIndex: ['movie', 'title'],
      render: (_, record) => (
        <>
          <span
            className={cn(
              'text-main-color line-clamp-1 block flex items-center gap-x-1 truncate',
              {
                'highlight-animated': record.movie.isFeatured
              }
            )}
            title={record.movie.title}
          >
            {record.movie.title}
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
      title: 'Phim',
      dataIndex: ['movie', 'type'],
      render: (value) => {
        const label = movieTypeOptions.find(
          (type) => type.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label || 'N/A'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Ngày phát hành',
      dataIndex: ['movie', 'releaseDate'],
      render: (value) =>
        convertUTCToLocal(value as string, DATE_FORMAT) || 'N/A',
      align: 'center',
      width: 150
    },
    {
      title: 'Độ tuổi',
      dataIndex: ['movie', 'ageRating'],
      render: (value) => {
        const ageRating = ageRatingOptions.find(
          (ageRating) => ageRating.value === value
        );
        return (
          <span className='line-clamp-1 block truncate' title={ageRating?.mean}>
            {ageRating?.label || 'N/A'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: ['movie', 'language'],
      render: (value) => {
        const label = languageOptions.find(
          (language) => language.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label || 'N/A'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Quốc gia',
      dataIndex: ['movie', 'country'],
      render: (value) => {
        const label = countryOptions.find(
          (country) => country.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label || 'N/A'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    handlers.renderActionColumn({
      actions: {
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.collectionItem.delete.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<CollectionItemSearchType>['searchFields'] =
    [];

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Bộ sưu tập',
          href: renderListPageUrl(
            route.collection.getList.path,
            serializeParams(restSearchParams)
          )
        },
        {
          label: (collectionTitle as string) || 'Phim'
        }
      ]}
    >
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: collectionItemSearchSchema
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
      <CollectionItemModal open={opened} onClose={close} />
    </PageWrapper>
  );
}
