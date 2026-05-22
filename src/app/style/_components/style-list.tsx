'use client';

import { ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode, objectNames, queryKeys } from '@/constants';
import { useListBase } from '@/hooks';
import type { Column, StyleResType, StyleSearchType } from '@/types';
import { notify, renderImageUrl } from '@/utils';
import { RiCheckboxCircleFill } from 'react-icons/ri';

export function StyleList() {
  const { data, pagination, loading, handlers } = useListBase<
    StyleResType,
    StyleSearchType
  >({
    apiConfig: apiConfig.style,
    options: {
      queryKey: queryKeys.STYLE,
      objectName: objectNames.STYLE
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.STYLE_ERROR_TYPE_NOT_HAVE_DEFAULT) {
          notify.error('Không thể xóa thiết kế mặc định');
        }
      };
    }
  });

  const columns: Column<StyleResType>[] = [
    {
      title: '#',
      dataIndex: 'imageMobileUrl',
      width: 64,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          freeAspect
          freePreviewAspect
        />
      )
    },
    {
      title: '#',
      dataIndex: 'imageWebUrl',
      width: 110,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          freeAspect
          freePreviewAspect
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value, record) => (
        <div className='flex items-center gap-x-2'>
          <span className='line-clamp-1 block truncate' title={value}>
            {value}
          </span>
          {record.isDefault && (
            <ToolTip title='Mặc định'>
              <RiCheckboxCircleFill className='size-5 text-emerald-500' />
            </ToolTip>
          )}
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.style.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.style.delete.permissionCode]
        })
      }
    })
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Thiết kế' }]}>
      <ListPageWrapper
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
