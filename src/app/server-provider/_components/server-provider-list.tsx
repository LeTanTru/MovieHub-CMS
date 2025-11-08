'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig } from '@/constants';
import { useListBase } from '@/hooks';
import { Column, ServerProviderResType } from '@/types';

export default function ServerProviderList({ queryKey }: { queryKey: string }) {
  const { data, loading, pagination, handlers } = useListBase<
    ServerProviderResType,
    any
  >({
    apiConfig: {
      ...apiConfig.serverProvider,
      getList: apiConfig.serverProvider.autoComplete
    },
    options: {
      objectName: 'máy chủ',
      queryKey
    }
  });
  const columns: Column<ServerProviderResType>[] = [
    { title: 'Tên', dataIndex: 'name' },
    {
      title: 'Số lượng tối đa',
      dataIndex: 'maxTenant',
      width: 150,
      align: 'center'
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'currentTenantCount',
      width: 150,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: { edit: true, changeStatus: true, delete: true }
    })
  ];
  return (
    <PageWrapper breadcrumbs={[{ label: 'Khách hàng' }]}>
      <ListPageWrapper
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
