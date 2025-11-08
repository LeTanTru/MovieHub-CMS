'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  STATUS_ACTIVE,
  STATUS_LOCK,
  statusOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { useChangeStatusCustomerMutation } from '@/queries';
import { route } from '@/routes';
import { customerSearchSchema } from '@/schemaValidations/customer.schema';
import {
  Column,
  CustomerResType,
  CustomerSearchType,
  SearchFormProps
} from '@/types';
import { generatePath, notify, renderImageUrl } from '@/utils';
import Link from 'next/link';
import { AiOutlineCheck, AiOutlineLock, AiOutlineUser } from 'react-icons/ai';

export default function CustomerList({ queryKey }: { queryKey: string }) {
  const { data, loading, pagination, handlers, listQuery } = useListBase<
    CustomerResType,
    CustomerSearchType
  >({
    apiConfig: apiConfig.customer,
    options: {
      objectName: 'khách hàng',
      queryKey
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: CustomerResType,
          buttonProps?: Record<string, any>
        ) => {
          return (
            <HasPermission
              requiredPermissions={[
                apiConfig.customer.changeStatus.permissionCode
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
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.CUSTOMER_ERROR_BUSINESS_EXISTED) {
          notify.error('Khách hàng này có doanh nghiệp đang hoạt động');
        }
      };
    }
  });

  const changeStatusMutation = useChangeStatusCustomerMutation();

  const handleChangeStatus = async (record: CustomerResType) => {
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

  const columns: Column<CustomerResType>[] = [
    {
      title: '#',
      dataIndex: ['account', 'avatarPath'],
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          icon={<AiOutlineUser className='size-7 text-slate-800' />}
          previewClassName='rounded'
          zoomSize={350}
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: ['account', 'fullName'],
      render: (value, record) => (
        <Link
          href={generatePath(route.customer.business.getList.path, {
            id: record.id
          })}
          className='text-dodger-blue'
        >
          {value ?? '---'}
        </Link>
      )
    },
    {
      title: 'Email',
      dataIndex: ['account', 'email'],
      width: 250,
      render: (value) => (
        <span className='line-clamp-1' title={value}>
          {value ?? '-----'}
        </span>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['account', 'phone'],
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
      actions: { edit: true, changeStatus: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<CustomerSearchType>['searchFields'] = [
    { key: 'fullName', placeholder: 'Họ tên' },
    {
      key: 'phone',
      placeholder: 'Số điện thoại'
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: statusOptions
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Khách hàng' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: customerSearchSchema
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
