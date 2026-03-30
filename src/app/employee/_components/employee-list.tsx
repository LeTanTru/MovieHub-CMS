'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  employeeStatusOptions,
  FieldTypes,
  MAX_PAGE_SIZE,
  STATUS_ACTIVE,
  STATUS_LOCK
} from '@/constants';
import { useListBase } from '@/hooks';
import { useChangeEmployeeStatusMutation, useGroupListQuery } from '@/queries';
import { employeeSearchSchema } from '@/schemaValidations';
import type {
  Column,
  EmployeeResType,
  EmployeeSearchType,
  SearchFormProps
} from '@/types';
import { getLastWord, notify, renderImageUrl } from '@/utils';
import { AiOutlineCheck, AiOutlineLock } from 'react-icons/ai';

export default function EmployeeList({ queryKey }: { queryKey: string }) {
  const { data: groupListData } = useGroupListQuery({ size: MAX_PAGE_SIZE });

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
          if (
            !handlers.hasPermission({
              requiredPermissions: [
                apiConfig.employee.changeStatus.permissionCode
              ]
            })
          )
            return null;
          return (
            <ToolTip
              title={
                record.status === STATUS_ACTIVE
                  ? 'Khóa tài khoản'
                  : 'Mở khóa tài khoản'
              }
              sideOffset={0}
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
                    <AiOutlineCheck className='text-main-color size-4' />
                  )}
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const { mutateAsync: changeStatusMutate, isPending: changeStatusLoading } =
    useChangeEmployeeStatusMutation();

  const handleChangeStatus = async (record: EmployeeResType) => {
    const message =
      record.status === STATUS_ACTIVE
        ? 'Khóa tài khoản thành công'
        : 'Mở khóa tài khoản thành công';
    await changeStatusMutate(
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
      render: (value, record) => (
        <AvatarField
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
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      width: 220,
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
      width: 150,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn({ statusOptions: employeeStatusOptions }),
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
      placeholder: 'Vai trò',
      type: FieldTypes.SELECT,
      options: groupListData?.data?.content.map((group) => ({
        label: group.name,
        value: group.kind
      }))
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: employeeStatusOptions
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Nhân viên' }]}>
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
          loading={loading || changeStatusLoading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
