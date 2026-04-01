'use client';

import { AiOutlineCheck, AiOutlineLock } from 'react-icons/ai';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  GROUP_KIND_ADMIN,
  STATUS_ACTIVE,
  STATUS_LOCK,
  statusOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { useChangeAccountStatusMutation } from '@/queries';
import { accountSearchSchema } from '@/schemaValidations';
import type {
  AccountAutoResType,
  AccountSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { getLastWord, notify, renderImageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminList({ queryKey }: { queryKey: string }) {
  const { mutateAsync: changeStatusMutate, isPending: changeStatusLoading } =
    useChangeAccountStatusMutation();

  const { data, pagination, loading, handlers, listQuery } = useListBase<
    AccountAutoResType,
    AccountSearchType
  >({
    apiConfig: apiConfig.account,
    options: {
      queryKey,
      objectName: 'tài khoản',
      defaultFilters: { kind: GROUP_KIND_ADMIN },
      notShowFromSearchParams: ['kind']
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: AccountAutoResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleChangeStatus = async (record: AccountAutoResType) => {
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
                onSuccess: (res) => {
                  if (res.result) {
                    listQuery.refetch();
                    notify.success(message);
                  }
                }
              }
            );
          };

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
            <span>{value}</span>
            <Badge
              className='w-fit text-xs font-normal'
              style={{
                borderColor: `${record.group.color}80`,
                color: `${record.group.color}`,
                backgroundColor: `${record.group.color}10`
              }}
            >
              {record.group.name ?? '---'}
            </Badge>
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
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.account.update.permissionCode]
        }),
        changeStatus: (record) =>
          handlers.hasPermission({
            requiredPermissions: [apiConfig.account.changeStatus.permissionCode]
          }) && !record.isSuperAdmin,
        delete: (record) =>
          handlers.hasPermission({
            requiredPermissions: [apiConfig.account.delete.permissionCode]
          }) && !record.isSuperAdmin
      }
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
          loading={loading || changeStatusLoading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
