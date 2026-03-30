'use client';

import { AvatarField } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  GROUP_KIND_ADMIN,
  statusOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { accountSearchSchema } from '@/schemaValidations';
import type {
  AccountAutoResType,
  AccountSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { getLastWord, renderImageUrl } from '@/utils';

export default function AdminList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    AccountAutoResType,
    AccountSearchType
  >({
    apiConfig: apiConfig.account,
    options: {
      queryKey,
      objectName: 'tài khoản',
      defaultFilters: { kind: GROUP_KIND_ADMIN },
      notShowFromSearchParams: ['kind']
    }
  });

  const columns: Column<AccountAutoResType>[] = [
    {
      title: '#',
      dataIndex: 'avatarPath',
      width: 80,
      align: 'center',
      render: (value, record) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          alt={getLastWord(record.fullName)}
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      render: (value, record) => {
        return (
          <div className='flex flex-col'>
            {value ?? '---'}
            <span className='text-xs text-gray-500'>{record.group.name}</span>
          </div>
        );
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 300,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '----'}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 200,
      render: (value) => (
        <span className='line-clamp-1' title={value}>
          {value ?? '-----'}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn(),
    handlers.renderActionColumn({
      actions: { edit: true, delete: (record) => !record.isSuperAdmin }
    })
  ];

  const searchFields: SearchFormProps<AccountSearchType>['searchFields'] = [
    { key: 'fullName', placeholder: 'Họ tên' },
    {
      key: 'email',
      placeholder: 'Email'
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: statusOptions
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Quản trị viên' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: accountSearchSchema
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
