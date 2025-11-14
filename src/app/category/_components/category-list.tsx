'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode } from '@/constants';
import { useListBase } from '@/hooks';
import { categorySearchSchema } from '@/schemaValidations';
import {
  CategoryResType,
  CategorySearchType,
  Column,
  SearchFormProps
} from '@/types';
import { notify } from '@/utils';

export default function CategoryList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    CategoryResType,
    CategorySearchType
  >({
    apiConfig: apiConfig.category,
    options: {
      queryKey,
      objectName: 'danh mục'
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.CATEGORY_ERROR_HAS_MOVIE) {
          notify.error('Danh mục này đang có phim liên kết');
        }
      };
    }
  });

  const columns: Column<CategoryResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    handlers.renderActionColumn({
      actions: { edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<CategorySearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên' }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Danh mục' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: categorySearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <BaseTable
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
