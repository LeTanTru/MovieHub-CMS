'use client';

import GroupPermissionModal from './group-permission-modal';
import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import { apiConfig, MAX_PAGE_SIZE } from '@/constants';
import { useDisclosure, useDragDrop, useListBase } from '@/hooks';
import type {
  Column,
  GroupPermissionResType,
  GroupPermissionSearchType
} from '@/types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export default function GroupPermissionList({
  queryKey
}: {
  queryKey: string;
}) {
  const { opened, open, close } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<GroupPermissionResType | null>(
    null
  );

  const {
    data: groupPermissionList,
    loading: groupPermissionListLoading,
    handlers
  } = useListBase<GroupPermissionResType, GroupPermissionSearchType>({
    apiConfig: apiConfig.groupPermission,
    options: {
      queryKey,
      objectName: 'nhóm quyền'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        edit: (
          record: GroupPermissionResType,
          buttonProps?: Record<string, any>
        ) => {
          return (
            <HasPermission
              requiredPermissions={[
                apiConfig.groupPermission.update.permissionCode as string
              ]}
            >
              <ToolTip title='Cập nhật nhóm quyền'>
                <span>
                  <Button
                    onClick={() => handleEditClick(record)}
                    className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                    {...buttonProps}
                  >
                    <AiOutlineEdit className='text-main-color size-4' />
                  </Button>
                </span>
              </ToolTip>
            </HasPermission>
          );
        }
      });
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<GroupPermissionResType>({
    key: `${queryKey}-list`,
    objectName: 'nhóm quyền',
    data: groupPermissionList,
    apiConfig: apiConfig.groupPermission.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const handleAdd = () => {
    open();
    setSelectedRow(null);
  };

  const handleEditClick = (record: GroupPermissionResType) => {
    open();
    setSelectedRow(record);
  };

  const columns: Column<GroupPermissionResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: 'Tên',
      dataIndex: 'name'
    },
    handlers.renderActionColumn({
      actions: {
        edit: true,
        delete: true
      }
    })
  ];

  return (
    <>
      <ListPageWrapper
        addButton={
          <HasPermission
            requiredPermissions={[
              apiConfig.groupPermission.create.permissionCode
            ]}
          >
            <Button onClick={handleAdd} variant='primary'>
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        }
        reloadButton={handlers.renderReloadButton()}
      >
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={groupPermissionListLoading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
        />
      </ListPageWrapper>
      <GroupPermissionModal
        open={opened}
        queryKey={queryKey}
        selectedRow={selectedRow}
        onClose={close}
      />
    </>
  );
}
