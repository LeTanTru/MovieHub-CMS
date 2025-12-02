'use client';

import { AvatarField, Button } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  DEFAULT_DATE_FORMAT,
  languageOptions,
  movieTypeOptions
} from '@/constants';
import { useDragDrop, useListBase } from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import { collectionItemSearchSchema } from '@/schemaValidations';
import {
  CollectionItemResType,
  CollectionItemSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { formatDate, renderImageUrl } from '@/utils';
import { Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AiOutlineFileImage } from 'react-icons/ai';

export default function CollectionItemList({ queryKey }: { queryKey: string }) {
  const { id: collectionId } = useParams<{ id: string }>();

  const { data, loading, handlers } = useListBase<
    CollectionItemResType,
    CollectionItemSearchType
  >({
    apiConfig: apiConfig.collectionItem,
    options: {
      queryKey,
      objectName: 'chi tiết bộ sưu tập'
    },
    override: (handlers) => {
      handlers.additionalParams = () => ({
        collectionId
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
  } = useDragDrop<CollectionItemResType>({
    key: `${queryKey}-list`,
    objectName: 'chi tiết bộ sưu tập',
    data,
    apiConfig: apiConfig.collectionItem.updateOrdering,
    sortField: 'ordering',
    mappingData: (record, index) => ({
      id: record.id,
      ordering: index,
      parentId: record.collectionId
    })
  });

  const columns: Column<CollectionItemResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: ['movie', 'thumbnailUrl'],
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
      dataIndex: ['movie', 'title'],
      render: (_, record) => (
        <>
          <span
            className={cn(
              'text-dodger-blue line-clamp-1 block flex items-center gap-x-1 truncate',
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
            title={`${record.movie.originalTitle}`}
          >
            {record.movie.originalTitle}
          </span>
        </>
      )
    },
    {
      title: 'Thể loại',
      dataIndex: ['movie', 'type'],
      render: (value) => {
        const label = movieTypeOptions.find(
          (type) => type.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label ?? '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Ngày phát hành',
      dataIndex: ['movie', 'releaseDate'],
      render: (value) => formatDate(value, DEFAULT_DATE_FORMAT) ?? '---',
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
            {ageRating?.label ?? '------'}
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
            {label ?? '------'}
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
            {label ?? '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    handlers.renderActionColumn({
      actions: { detail: true, edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<CollectionItemSearchType>['searchFields'] =
    [];

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Bộ sưu tập',
          href: route.collection.getList.path
        },
        {
          label: 'Chi tiết bộ sưu tập'
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
