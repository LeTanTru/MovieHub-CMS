'use client';

import CategoryModal from '@/app/category/_components/category-modal';
import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode } from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import { categorySearchSchema } from '@/schemaValidations';
import {
  CategoryResType,
  CategorySearchType,
  Column,
  SearchFormProps
} from '@/types';
import { notify } from '@/utils';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export default function CategoryList({ queryKey }: { queryKey: string }) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResType | null>(null);
  const categoryModal = useDisclosure(false);

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
      handlers.renderAddButton = () => {
        return (
          <HasPermission
            requiredPermissions={[apiConfig.category.create.permissionCode]}
          >
            <Button variant={'primary'} onClick={handleAddCategory}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
      handlers.additionalColumns = () => ({
        edit: (record: CategoryResType, buttonProps?: Record<string, any>) => {
          if (
            !handlers.hasPermission({
              requiredPermissions: [apiConfig.category.update.permissionCode]
            })
          )
            return null;
          return (
            <ToolTip title={`Cập nhật danh mục`} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateCategory(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineEdit className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const handleAddCategory = () => {
    setSelectedCategory(null);
    categoryModal.open();
  };

  const handleUpdateCategory = (record: CategoryResType) => {
    setSelectedCategory(record);
    categoryModal.open();
  };

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
      <CategoryModal
        open={categoryModal.opened}
        close={categoryModal.close}
        category={selectedCategory}
      />
    </PageWrapper>
  );
}
