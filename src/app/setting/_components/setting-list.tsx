'use client';

import { SettingModal } from './setting-modal';
import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, objectNames, queryKeys } from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import type { Column, SettingResType, SettingSearchType } from '@/types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export function SettingList({ groupName }: { groupName: string }) {
  const { opened, open, close } = useDisclosure();
  const [selectedSetting, setSelectedSetting] = useState<SettingResType | null>(
    null
  );

  const { data, pagination, loading, handlers } = useListBase<
    SettingResType,
    SettingSearchType
  >({
    apiConfig: apiConfig.setting,
    options: {
      queryKey: queryKeys.SETTING,
      objectName: objectNames.SETTING,
      defaultFilters: {
        groupName
      },
      notShowFromSearchParams: ['groupName']
    },
    override: (handlers) => {
      handlers.renderAddButton = () => {
        const handleAddSetting = () => {
          setSelectedSetting(null);
          open();
        };

        return (
          <HasPermission
            requiredPermissions={[apiConfig.setting.create.permissionCode]}
          >
            <Button variant='primary' onClick={handleAddSetting}>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };
      handlers.additionalColumns = () => ({
        edit: (record: SettingResType, buttonProps?: Record<string, any>) => {
          const handleUpdateSetting = (record: SettingResType) => {
            setSelectedSetting(record);
            open();
          };

          return (
            <ToolTip title='Cập nhật cài đặt' sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateSetting(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineEdit className='text-main-color size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
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
        delete: (record) =>
          !record.isSystem &&
          handlers.hasPermission({
            requiredPermissions: [apiConfig.setting.delete.permissionCode]
          })
      }
    })
  ];

  return (
    <>
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
      <SettingModal
        open={opened}
        setting={selectedSetting}
        groupName={groupName}
        onClose={close}
      />
    </>
  );
}
