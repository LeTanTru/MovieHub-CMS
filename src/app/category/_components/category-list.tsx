'use client';

import { CategoryModal } from '@/app/category/_components/category-modal';
import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode, objectNames, queryKeys } from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import { categorySearchSchema } from '@/schemaValidations';
import type {
  CategoryResType,
  CategorySearchType,
  Column,
  SearchFormProps
} from '@/types';
import { notify } from '@/utils';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export function CategoryList() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResType | null>(null);
  const { opened, open, close } = useDisclosure();

  const { data, pagination, loading, handlers } = useListBase<
    CategoryResType,
    CategorySearchType
  >({
    apiConfig: apiConfig.category,
    options: {
      queryKey: queryKeys.CATEGORY,
      objectName: objectNames.CATEGORY
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.CATEGORY_ERROR_HAS_MOVIE) {
          notify.error('Thể loại này đang có phim liên kết');
        }
      };
      handlers.renderAddButton = () => {
        const handleAddCategory = () => {
          setSelectedCategory(null);
          open();
        };
        return (
          <HasPermission
            requiredPermissions={[apiConfig.category.create.permissionCode]}
          >
            <Button variant='primary' onClick={handleAddCategory}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
      handlers.additionalColumns = () => ({
        edit: (record: CategoryResType, buttonProps?: Record<string, any>) => {
          const handleUpdateCategory = (record: CategoryResType) => {
            setSelectedCategory(record);
            open();
          };

          return (
            <ToolTip title='Cập nhật thể loại' sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateCategory(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineEdit className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const columns: Column<CategoryResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.category.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.category.delete.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<CategorySearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên' }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Thể loại' }]}>
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
        open={opened}
        onClose={close}
        category={selectedCategory}
      />
    </PageWrapper>
  );
}
