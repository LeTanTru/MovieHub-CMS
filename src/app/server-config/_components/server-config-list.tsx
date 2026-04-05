'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, queryKeys, STATUS_ACTIVE } from '@/constants';
import { useListBase } from '@/hooks';
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
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

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
                active: !record.status
              },
              {
                onSuccess: (res) => {
                  if (res.result) {
                    notify.success('Cập nhật trạng thái thành công');
                    handlers.invalidateQueries();
                  } else {
                    notify.error('Cập nhật trạng thái thất bại');
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
            record.status === STATUS_ACTIVE
              ? AiOutlineEyeInvisible
              : AiOutlineEye;

          const statusLabel =
            record.status === STATUS_ACTIVE ? 'Hoạt động' : 'Không hoạt động';

          return (
            <ToolTip title={statusLabel} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeStatus();
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <Icon className='text-main-color size-4' />
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
      title: 'Số server',
      dataIndex: 'serverNumber',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      width: 150,
      align: 'center'
    },
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
    <PageWrapper breadcrumbs={[{ label: 'Thể loại' }]}>
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
