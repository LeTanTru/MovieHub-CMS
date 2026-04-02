'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, queryKeys, serverStatusOptions } from '@/constants';
import { useListBase } from '@/hooks';
import { serverConfigSearchSchema } from '@/schemaValidations';
import {
  Column,
  SearchFormProps,
  ServerConfigResType,
  ServerConfigSearchType
} from '@/types';

export default function ServerConfigList() {
  const { data, pagination, loading, handlers } = useListBase<
    ServerConfigResType,
    ServerConfigSearchType
  >({
    apiConfig: apiConfig.serverConfig,
    options: {
      queryKey: queryKeys.SERVER_CONFIG,
      objectName: 'máy chủ'
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
    handlers.renderStatusColumn({
      statusOptions: serverStatusOptions,
      columnProps: { width: 200 }
    }),
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.serverConfig.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.serverConfig.delete.permissionCode]
        })
      },
      columnProps: { fixed: true }
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
