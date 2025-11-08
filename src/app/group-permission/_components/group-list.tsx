'use client';

import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { apiConfig, FieldTypes, groupKinds } from '@/constants';
import { useListBase } from '@/hooks';
import { groupSearchSchema } from '@/schemaValidations';
import {
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
      objectName: 'vai trò'
    }
  });

  const columns: Column<GroupResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'name'
    },
    {
      title: 'Nhóm',
      dataIndex: 'kind',
      render: (value) => {
        const groupKind = groupKinds.find((gk) => gk.value === value);
        return (
          <Badge style={{ backgroundColor: groupKind?.color }}>
            {groupKind?.label}
          </Badge>
        );
      },
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        edit: true,
        delete: (record) => !record.isSystemRole
      }
    })
  ];

  const searchFields: SearchFormProps<GroupSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên quyền' },
    {
      key: 'kind',
      type: FieldTypes.SELECT,
      options: groupKinds,
      placeholder: 'Nhóm',
      submitOnChanged: true
    }
  ];

  return (
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
  );
}
