'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig } from '@/constants';
import { useListBase } from '@/hooks';
import { groupSearchSchema } from '@/schemaValidations';
import type {
  Column,
  GroupResType,
  GroupSearchType,
  SearchFormProps
} from '@/types';

export default function GroupList({ queryKey }: { queryKey: string }) {
  const { data, loading, handlers, pagination } = useListBase<
    GroupResType,
    GroupSearchType
  >({
    apiConfig: apiConfig.group,
    options: {
      queryKey,
      objectName: 'quyền'
    }
  });

  const columns: Column<GroupResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'name'
    },
    handlers.renderActionColumn({
      actions: {
        edit: true,
        delete: (record) => !record.isSystemRole
      }
    })
  ];

  const searchFields: SearchFormProps<GroupSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên quyền' }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Quyền' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: groupSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <BaseTable
          columns={columns}
          dataSource={data?.sort((a, b) => a.kind - b.kind)}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
