'use client';

import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, queryKeys } from '@/constants';
import { useListBase } from '@/hooks';
import { settingSearchSchema } from '@/schemaValidations';
import type {
  Column,
  SearchFormProps,
  SettingResType,
  SettingSearchType
} from '@/types';

export default function SettingList() {
  const { data, pagination, loading, handlers } = useListBase<
    SettingResType,
    SettingSearchType
  >({
    apiConfig: apiConfig.setting,
    options: {
      queryKey: queryKeys.SETTING,
      objectName: 'cài đặt'
    }
  });

  const columns: Column<SettingResType>[] = [
    {
      title: 'Tên',
      dataIndex: 'keyName',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      width: 300
    },
    {
      title: 'Nhóm',
      dataIndex: 'groupName',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      width: 200
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    {
      title: 'Giá trị',
      dataIndex: 'valueData',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value}
        </span>
      ),
      align: 'left'
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.setting.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.setting.delete.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<SettingSearchType>['searchFields'] = [
    { key: 'keyName', placeholder: 'Tên' },
    { key: 'groupName', placeholder: 'Nhóm' },
    { key: 'dataType', placeholder: 'Kiểu dữ liệu' },
    { key: 'valueData', placeholder: 'Giá trị' }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Cài đặt' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: settingSearchSchema
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
