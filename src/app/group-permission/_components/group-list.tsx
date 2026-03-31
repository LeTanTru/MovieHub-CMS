'use client';

import { ToolTip } from '@/components/form';
import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { apiConfig, ErrorCode, FieldTypes, groupKinds } from '@/constants';
import { useListBase } from '@/hooks';
import { groupSearchSchema } from '@/schemaValidations';
import type {
  Column,
  GroupResType,
  GroupSearchType,
  SearchFormProps
} from '@/types';
import { notify } from '@/utils';

export default function GroupList({ queryKey }: { queryKey: string }) {
  const { data, loading, handlers, pagination } = useListBase<
    GroupResType,
    GroupSearchType
  >({
    apiConfig: apiConfig.group,
    options: {
      queryKey,
      objectName: 'vai trò'
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.GROUP_ERROR_IN_USED) {
          notify.error('Vai trò này đang được sử dụng');
        }
      };
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
          <Badge
            className='text-sm font-normal'
            style={{
              borderColor: `${groupKind?.color}80`,
              color: `${groupKind?.color}`,
              backgroundColor: `${groupKind?.color}10`
            }}
          >
            {groupKind?.label}
          </Badge>
        );
      },
      width: 120,
      align: 'center'
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      render: (value) => {
        return value ? (
          <ToolTip title={value}>
            <div
              className='mx-auto h-6 w-20 rounded'
              style={{ background: value }}
            ></div>
          </ToolTip>
        ) : (
          '----'
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
    { key: 'name', placeholder: 'Tên vai trò' },
    {
      key: 'kind',
      type: FieldTypes.SELECT,
      options: groupKinds,
      placeholder: 'Vai trò',
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
