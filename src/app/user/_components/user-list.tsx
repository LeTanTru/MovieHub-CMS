'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  queryKeys,
  STATUS_ACTIVE,
  STATUS_LOCK,
  employeeStatusOptions,
  userKindOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import { useChangeUserStatusMutation } from '@/queries';
import { userSearchSchema } from '@/schemaValidations';
import type {
  UserResType,
  UserSearchType,
  Column,
  SearchFormProps,
  ApiResponse
} from '@/types';
import { getLastWord, notify, renderImageUrl } from '@/utils';
import { AiOutlineCheck, AiOutlineLock } from 'react-icons/ai';

export default function UserList() {
  const { mutateAsync: changeStatusMutate, isPending: changeStatusLoading } =
    useChangeUserStatusMutation();

  const { data, pagination, loading, handlers } = useListBase<
    UserResType,
    UserSearchType
  >({
    apiConfig: apiConfig.user,
    options: {
      queryKey: queryKeys.USER,
      objectName: 'người dùng'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: UserResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleChangeStatus = async (record: UserResType) => {
            const message =
              record.status === STATUS_ACTIVE
                ? 'Khóa tài khoản thành công'
                : 'Mở khóa tài khoản thành công';
            await changeStatusMutate(
              {
                id: record.id,
                status:
                  record.status === STATUS_ACTIVE ? STATUS_LOCK : STATUS_ACTIVE
              },
              {
                onSuccess: (res: ApiResponse<any>) => {
                  if (res.result) {
                    handlers.invalidateQueries();
                    notify.success(message);
                  }
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
                      'text-main-color': record.status !== STATUS_ACTIVE,
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

  const columns: Column<UserResType>[] = [
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
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 300,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 200,
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value || 'N/A'}
        </span>
      ),
      align: 'center'
    },
    handlers.renderStatusColumn(),
    handlers.renderActionColumn({
      actions: {
        changeStatus: handlers.hasPermission({
          requiredPermissions: [apiConfig.user.changeStatus.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<UserSearchType>['searchFields'] = [
    { key: 'fullName', placeholder: 'Họ tên' },
    {
      key: 'phone',
      placeholder: 'Số điện thoại'
    },
    {
      key: 'kind',
      placeholder: 'Vai trò',
      type: FieldTypes.SELECT,
      options: userKindOptions
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: employeeStatusOptions
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Người dùng' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: userSearchSchema
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
