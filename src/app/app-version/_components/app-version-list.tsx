'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  objectNames,
  queryKeys
} from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import { appVersionSearchSchema } from '@/schemaValidations';
import type {
  AppVersionResType,
  AppVersionSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { convertUTCToLocal, notify } from '@/utils';

export const AppVersionList = () => {
  const { data, pagination, loading, handlers } = useListBase<
    AppVersionResType,
    AppVersionSearchType
  >({
    apiConfig: apiConfig.appVersion,
    options: {
      queryKey: queryKeys.APP_VERSION,
      objectName: objectNames.APP_VERSION
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.APP_VERSION_ERROR_NOT_HAVE_LATEST_VERSION) {
          notify.error('Không thể xóa phiên bản mới nhất');
        }
      };
    }
  });

  const columns: Column<AppVersionResType>[] = [
    {
      title: 'Tên phiên bản',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      render: (value) => (
        <span
          className='line-clamp-1 block truncate'
          title={convertUTCToLocal(value)}
        >
          {convertUTCToLocal(value)}
        </span>
      ),
      width: 200,
      align: 'center'
    },
    {
      title: 'Mã phiên bản',
      dataIndex: 'code',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <div className='flex items-center justify-center gap-2'>
          <Badge
            variant='outline'
            className={cn('text-sm font-normal', {
              'border-rose-400 bg-rose-100 text-rose-600': record.forceUpdate,
              'border-emerald-400 bg-emerald-100 text-emerald-600':
                !record.forceUpdate
            })}
          >
            {record.forceUpdate
              ? 'Bắt buộc cập nhật'
              : 'Không bắt buộc cập nhật'}
          </Badge>

          <Badge
            variant='outline'
            className={cn('text-sm font-normal', {
              'border-sky-400 bg-sky-100 text-sky-600': record.isLatest,
              'border-gray-400 bg-gray-100 text-gray-600': !record.isLatest
            })}
          >
            {record.isLatest ? 'Mới nhất' : 'Cũ'}
          </Badge>
        </div>
      ),
      width: 300,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        download: true,
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.appVersion.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.appVersion.delete.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<AppVersionSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên phiên bản' },
    { key: 'code', placeholder: 'Mã phiên bản' },
    { key: 'isLatest', placeholder: 'Mới nhất', type: FieldTypes.BOOLEAN },
    {
      key: 'forceUpdate',
      placeholder: 'Bắt buộc cập nhật',
      type: FieldTypes.BOOLEAN
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Phiên bản ứng dụng' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: appVersionSearchSchema
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
};
