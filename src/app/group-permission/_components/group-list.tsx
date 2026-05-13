'use client';

import { ToolTip } from '@/components/form';
import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import {
  apiConfig,
  ErrorCode,
  FieldTypes,
  groupKinds,
  objectNames,
  queryKeys
} from '@/constants';
import { useListBase } from '@/hooks';
import { groupSearchSchema } from '@/schemaValidations';
import type {
  Column,
  GroupResType,
  GroupSearchType,
  SearchFormProps
} from '@/types';
import { notify } from '@/utils';

export default function GroupList() {
  const { data, loading, handlers, pagination } = useListBase<
    GroupResType,
    GroupSearchType
  >({
    apiConfig: apiConfig.group,
    options: {
      queryKey: queryKeys.GROUP,
      objectName: objectNames.GROUP
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
        if (!groupKind) {
          return <span className='text-gray-400'>N/A</span>;
        }
        return (
          <Badge
            className='text-sm font-normal'
            style={{
              borderColor: `${groupKind.color}80`,
              color: `${groupKind.color}`,
              backgroundColor: `${groupKind.color}10`
            }}
          >
            {groupKind.label}
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
        return (
          <ToolTip title={value}>
            <Badge
              className='text-sm font-normal'
              style={{
                borderColor: `${value}80`,
                color: `${value}`,
                backgroundColor: `${value}10`
              }}
            >
              {value}
            </Badge>
          </ToolTip>
        );
      },
      width: 120,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.group.update.permissionCode]
        }),
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
