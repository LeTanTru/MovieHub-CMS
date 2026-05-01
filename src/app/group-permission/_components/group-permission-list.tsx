'use client';

import GroupPermissionModal from './group-permission-modal';
import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import { apiConfig, MAX_PAGE_SIZE, queryKeys } from '@/constants';
import { useDisclosure, useDragDrop, useListBase } from '@/hooks';
import type {
  Column,
  GroupPermissionResType,
  GroupPermissionSearchType
} from '@/types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';

export default function GroupPermissionList() {
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
      queryKey: queryKeys.GROUP_PERMISSION,
      objectName: 'nhóm quyền'
    },
    override: (handlers) => {
      handlers.renderAddButton = () => {
        const handleAdd = () => {
          open();
          setSelectedRow(null);
        };

        return (
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
        );
      };

      handlers.additionalColumns = () => ({
        edit: (
          record: GroupPermissionResType,
          buttonProps?: Record<string, any>
        ) => {
          const handleEditClick = (record: GroupPermissionResType) => {
            open();
            setSelectedRow(record);
          };

          return (
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
    key: queryKeys.GROUP_PERMISSION_LIST,
    objectName: 'nhóm quyền',
    data: groupPermissionList,
    apiConfig: apiConfig.groupPermission.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<GroupPermissionResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [
        apiConfig.groupPermission.updateOrdering.permissionCode
      ]
    })
      ? [sortColumn]
      : []),
    {
      title: 'Tên',
      dataIndex: 'name'
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.groupPermission.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.groupPermission.delete.permissionCode]
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
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={groupPermissionListLoading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
        />
      </ListPageWrapper>
      <GroupPermissionModal
        open={opened}
        selectedRow={selectedRow}
        onClose={close}
      />
    </>
  );
}
