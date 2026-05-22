'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import {
  apiConfig,
  employeeStatusOptions,
  FieldTypes,
  MAX_PAGE_SIZE,
  objectNames,
  queryKeys,
  STATUS_ACTIVE,
  STATUS_LOCK
} from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import { logger } from '@/logger';
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

export function EmployeeList() {
  const { data: groupListData } = useGroupListQuery({ size: MAX_PAGE_SIZE });

  const { mutateAsync: changeStatusMutate, isPending: changeStatusLoading } =
    useChangeEmployeeStatusMutation();

  const { data, pagination, loading, handlers } = useListBase<
    EmployeeResType,
    EmployeeSearchType
  >({
    apiConfig: apiConfig.employee,
    options: {
      queryKey: queryKeys.EMPLOYEE,
      objectName: objectNames.EMPLOYEE
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: EmployeeResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleChangeStatus = async (record: EmployeeResType) => {
            await changeStatusMutate(
              {
                id: record.id,
                status:
                  record.status === STATUS_ACTIVE ? STATUS_LOCK : STATUS_ACTIVE
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    handlers.invalidateQueries();
                    notify.success(
                      `${record.status === STATUS_ACTIVE ? 'Khóa' : 'Mở khóa'} tài khoản thành công`
                    );
                  } else {
                    notify.error(
                      `${record.status === STATUS_ACTIVE ? 'Khóa' : 'Mở khóa'} tài khoản thất bại`
                    );
                  }
                },
                onError: (error) => {
                  logger.error('[CHANGE_STATUS_ERROR]', error);
                  notify.error(
                    `${record.status === STATUS_ACTIVE ? 'Khóa' : 'Mở khóa'} tài khoản thất bại`
                  );
                }
              }
            );
          };

          const Icon =
            record.status === STATUS_ACTIVE ? AiOutlineLock : AiOutlineCheck;

          const statusLabel =
            record.status === STATUS_ACTIVE
              ? 'Khóa tài khoản'
              : 'Mở khóa tài khoản';

          return (
            <ToolTip title={statusLabel} sideOffset={0}>
              <span>
                <Button
                  onClick={() => handleChangeStatus(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <Icon
                    className={cn('size-4', {
                      'text-main-color': record.status === STATUS_LOCK,
                      'text-destructive': record.status === STATUS_ACTIVE
                    })}
                  />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

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
            <span>{value}</span>
            <Badge
              className='w-fit text-xs font-normal'
              style={{
                borderColor: `${record.group.color}80`,
                color: `${record.group.color}`,
                backgroundColor: `${record.group.color}10`
              }}
            >
              {record.group.name}
            </Badge>
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
          {value}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 150,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn({ statusOptions: employeeStatusOptions }),
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.employee.update.permissionCode]
        }),
        changeStatus: handlers.hasPermission({
          requiredPermissions: [apiConfig.employee.changeStatus.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.employee.delete.permissionCode]
        })
      },
      columnProps: {
        width: 150
      }
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
      options: groupListData?.content.map((group) => ({
        label: group.name,
        value: group.kind
      })),
      submitOnChanged: true
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: employeeStatusOptions,
      submitOnChanged: true
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
