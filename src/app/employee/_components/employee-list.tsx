'use client';

import { AvatarField } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, FieldTypes, statusOptions } from '@/constants';
import { useListBase } from '@/hooks';
import { employeeSearchSchema } from '@/schemaValidations';
import {
  Column,
  EmployeeResType,
  EmployeeSearchType,
  SearchFormProps
} from '@/types';
import { renderImageUrl } from '@/utils';
import { AiOutlineUser } from 'react-icons/ai';

export default function EmployeeList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    EmployeeResType,
    EmployeeSearchType
  >({
    apiConfig: apiConfig.employee,
    options: {
      queryKey,
      objectName: 'nhân viên'
    }
  });

  const columns: Column<EmployeeResType>[] = [
    {
      title: '#',
      dataIndex: 'avatarPath',
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          icon={<AiOutlineUser className='size-7 text-slate-800' />}
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      render: (value) => value ?? '---'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 250,
      render: (value) => (
        <span className='line-clamp-1' title={value}>
          {value ?? '----'}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 120,
      render: (value) => (
        <span className='line-clamp-1' title={value}>
          {value ?? '-----'}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn(),
    handlers.renderActionColumn({
      actions: { edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<EmployeeSearchType>['searchFields'] = [
    { key: 'fullName', placeholder: 'Họ tên' },
    {
      key: 'phone',
      placeholder: 'Số điện thoại'
    },
    {
      key: 'kind',
      placeholder: 'Vai trò'
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
          schema: employeeSearchSchema
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
