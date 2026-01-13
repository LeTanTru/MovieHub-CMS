'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode, FieldTypes } from '@/constants';
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

export default function AppVersionList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    AppVersionResType,
    AppVersionSearchType
  >({
    apiConfig: apiConfig.appVersion,
    options: {
      queryKey,
      objectName: 'phiên bản ứng dụng'
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
          {value ?? '------'}
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
          {convertUTCToLocal(value) ?? '------'}
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
          {value ?? '------'}
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
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-sm',
              record.forceUpdate
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'
            )}
          >
            {record.forceUpdate
              ? 'Bắt buộc cập nhật'
              : 'Không bắt buộc cập nhật'}
          </span>

          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-sm',
              record.isLatest
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-600'
            )}
          >
            {record.isLatest ? 'Mới nhất' : 'Cũ'}
          </span>
        </div>
      ),
      width: 300,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: { download: true, edit: true, delete: true }
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
}
