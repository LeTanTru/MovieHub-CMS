'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  STATUS_ACTIVE,
  STATUS_LOCK,
  statusOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { useChangeEmployeeStatusMutation } from '@/queries';
import { employeeSearchSchema } from '@/schemaValidations';
import {
  Column,
  EmployeeResType,
  EmployeeSearchType,
  SearchFormProps
} from '@/types';
import { notify, renderImageUrl } from '@/utils';
import { AiOutlineCheck, AiOutlineLock, AiOutlineUser } from 'react-icons/ai';

export default function EmployeeList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers, listQuery } = useListBase<
    EmployeeResType,
    EmployeeSearchType
  >({
    apiConfig: apiConfig.employee,
    options: {
      queryKey,
      objectName: 'nhân viên'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: EmployeeResType,
          buttonProps?: Record<string, any>
        ) => {
          return (
            <HasPermission
              requiredPermissions={[
                apiConfig.employee.changeStatus.permissionCode
              ]}
            >
              <ToolTip
                title={
                  record.status === STATUS_ACTIVE
                    ? 'Khóa tài khoản'
                    : 'Mở khóa tài khoản'
                }
              >
                <span>
                  <Button
                    onClick={() => handleChangeStatus(record)}
                    className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                    {...buttonProps}
                  >
                    {record.status === STATUS_ACTIVE ? (
                      <AiOutlineLock className='text-destructive size-4' />
                    ) : (
                      <AiOutlineCheck className='text-dodger-blue size-4' />
                    )}
                  </Button>
                </span>
              </ToolTip>
            </HasPermission>
          );
        }
      });
    }
  });

  const changeStatusMutation = useChangeEmployeeStatusMutation();

  const handleChangeStatus = async (record: EmployeeResType) => {
    const message =
      record.status === STATUS_ACTIVE
        ? 'Khóa tài khoản thành công'
        : 'Mở khóa tài khoản thành công';
    await changeStatusMutation.mutateAsync(
      {
        id: record.id,
        status: record.status === STATUS_ACTIVE ? STATUS_LOCK : STATUS_ACTIVE
      },
      {
        onSuccess: (res) => {
          if (res.result) {
            listQuery.refetch();
            notify.success(message);
          }
        }
      }
    );
  };

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
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 120,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn(),
    handlers.renderActionColumn({
      actions: { edit: true, changeStatus: true, delete: true }
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
          loading={loading || changeStatusMutation.isPending}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
