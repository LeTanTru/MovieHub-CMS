'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  queryKeys,
  serverConfigStatusOptions,
  STATUS_ACTIVE,
  STATUS_LOCK,
  STATUS_PENDING
} from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { useChangeServerConfigStatusMutation } from '@/queries';
import { serverConfigSearchSchema } from '@/schemaValidations';
import {
  Column,
  SearchFormProps,
  ServerConfigResType,
  ServerConfigSearchType
} from '@/types';
import { notify } from '@/utils';
import { AiOutlineCheck, AiOutlineLock } from 'react-icons/ai';

export default function ServerConfigList() {
  const { mutateAsync: changeStatusMutate } =
    useChangeServerConfigStatusMutation();

  const { data, pagination, loading, handlers } = useListBase<
    ServerConfigResType,
    ServerConfigSearchType
  >({
    apiConfig: apiConfig.serverConfig,
    options: {
      queryKey: queryKeys.SERVER_CONFIG,
      objectName: 'máy chủ'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        changeStatus: (
          record: ServerConfigResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleChangeStatus = async () => {
            await changeStatusMutate(
              {
                id: record.id,
                status:
                  record.status === STATUS_ACTIVE ? STATUS_LOCK : STATUS_ACTIVE
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success(
                      `${record.status === STATUS_ACTIVE ? 'Khóa' : 'Mở khóa'} máy chủ thành công`
                    );
                    handlers.invalidateQueries();
                  } else {
                    notify.error(
                      `${record.status === STATUS_ACTIVE ? 'Khóa' : 'Mở khóa'} máy chủ thất bại, vui lòng thử lại sau.`
                    );
                  }
                },
                onError: (error) => {
                  logger.error('Error while changing status:', error);
                  notify.error('Có lỗi xảy ra, vui lòng thử lại sau.');
                }
              }
            );
          };

          const Icon =
            record.status === STATUS_ACTIVE ? AiOutlineLock : AiOutlineCheck;

          const statusLabel =
            record.status === STATUS_ACTIVE
              ? 'Khóa máy chủ'
              : 'Mở khóa máy chủ';

          if (record.status === STATUS_PENDING) return null;

          return (
            <ToolTip title={statusLabel} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeStatus();
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  disabled={record.status === STATUS_PENDING}
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

  const columns: Column<ServerConfigResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      align: 'center'
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Cổng',
      dataIndex: 'port',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Máy chủ No.',
      dataIndex: 'serverNumber',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    handlers.renderStatusColumn({
      statusOptions: serverConfigStatusOptions
    }),
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.serverConfig.update.permissionCode]
        }),
        changeStatus: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.serverConfig.changeStatus.permissionCode
          ]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.serverConfig.delete.permissionCode]
        })
      },
      columnProps: {
        width: 150
      }
    })
  ];

  const searchFields: SearchFormProps<ServerConfigSearchType>['searchFields'] =
    [{ key: 'name', placeholder: 'Tên' }];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Máy chủ' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: serverConfigSearchSchema
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
