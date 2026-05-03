'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { NoData } from '@/components/no-data';
import { ConfirmModal } from '@/components/modal';
import { Separator } from '@/components/ui/separator';
import {
  DEFAULT_TABLE_PAGE_START,
  MAX_PAGE_SIZE,
  queryKeys
} from '@/constants';
import { useDisclosure } from '@/hooks';
import { cn } from '@/lib';
import {
  useDeletePermissionMutation,
  useGroupPermissionListQuery,
  usePermissionListQuery
} from '@/queries';
import type { PermissionResType } from '@/types';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import MediaQuery from 'react-responsive';
import PermissionModal from './permission-modal';
import { invalidateQueries, notify } from '@/utils';
import { logger } from '@/logger';

export default function PermissionList() {
  const { opened, open, close } = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<PermissionResType | null>(
    null
  );
  const [selectedGroupPermissionId, setSelectedGroupPermissionId] =
    useState<string>('');

  const { data: groupPermissionListData, isLoading: groupPermissionLoading } =
    useGroupPermissionListQuery({
      page: DEFAULT_TABLE_PAGE_START,
      size: MAX_PAGE_SIZE
    });

  const { data: permissionListData, isLoading: permissionListLoading } =
    usePermissionListQuery({
      page: DEFAULT_TABLE_PAGE_START,
      size: MAX_PAGE_SIZE
    });

  const { mutateAsync: deletePermissionMutate } = useDeletePermissionMutation();

  const groupPermissions = useMemo(() => {
    return groupPermissionListData?.content || [];
  }, [groupPermissionListData?.content]);
  const permissions = permissionListData?.content || [];

  const loading = permissionListLoading || groupPermissionLoading;

  const groupedPermissions = (permissions || []).reduce(
    (acc, permission) => {
      const group = permission.groupPermission.name || 'Unknown';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({ ...permission });
      return acc;
    },
    {} as Record<string, PermissionResType[]>
  );

  (groupPermissions || [])
    .map((group) => group.name)
    .forEach((groupName) => {
      if (!groupedPermissions[groupName]) {
        groupedPermissions[groupName] = [];
      }
    });

  const handleAdd = (group: string) => {
    const groupPermission = groupPermissions.find((gp) => gp.name === group);
    setSelectedRow(null);
    setSelectedGroupPermissionId(groupPermission?.id || '');
    open();
  };

  const handleEdit = (record: PermissionResType) => {
    setSelectedRow(record);
    setSelectedGroupPermissionId(record.groupPermission.id);
    open();
  };

  const handleDelete = async (record: PermissionResType) => {
    deletePermissionMutate(record.id, {
      onSuccess: async (res) => {
        if (res.result) {
          invalidateQueries([queryKeys.PERMISSION_LIST]);
          notify.success('Xóa quyền thành công');
        } else {
          notify.error('Xóa quyền thất bại');
        }
      },
      onError: (error) => {
        logger.error('[DELETE_PERMISSION_ERROR]', error);
        notify.error('Xóa quyền thất bại');
      }
    });
  };

  const handleClose = () => {
    close();
    setSelectedRow(null);
  };

  return (
    <>
      <ListPageWrapper>
        <div className='relative flex flex-col gap-y-4 px-4 py-4 max-[1560px]:max-w-300'>
          {loading ? (
            <div className='absolute inset-0 flex justify-center bg-white/80'>
              <CircleLoading className='stroke-main-color mt-20' />
            </div>
          ) : (
            groupPermissions.map((groupPermission) => {
              const group = groupPermission.name;
              const permissionList = groupedPermissions[group];
              return (
                <div
                  className='rounded-lg border border-solid border-gray-200 text-sm'
                  key={group}
                >
                  <div className='flex items-center justify-between border-b border-solid border-b-gray-200 py-2 pr-2 pl-4'>
                    <div className='font-semibold'>{group}</div>
                    <ToolTip sideOffset={8} title='Thêm quyền'>
                      <Plus
                        className='stroke-main-color size-4 cursor-pointer transition-all duration-200 ease-linear hover:opacity-80'
                        onClick={() => handleAdd(group)}
                      />
                    </ToolTip>
                  </div>
                  <div
                    className={cn('grid gap-4 p-4', {
                      'grid-cols-4 max-[1560px]:grid-cols-3':
                        permissionList?.length > 0
                    })}
                  >
                    {permissionList?.length > 0 ? (
                      permissionList
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((permission: PermissionResType, index: number) => {
                          return (
                            <div key={permission.id}>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium'>
                                  {permission.name}
                                </span>
                                <div className='flex items-center justify-center gap-x-4'>
                                  <ToolTip
                                    title={`Cập nhật ${permission.name}`}
                                  >
                                    <Button
                                      className='h-5 border-none bg-transparent p-0! shadow-none hover:bg-transparent'
                                      onClick={() => handleEdit(permission)}
                                    >
                                      <AiOutlineEdit className='text-main-color size-4' />
                                    </Button>
                                  </ToolTip>
                                  <ConfirmModal
                                    message={`Bạn có chắc chắn muốn xóa quyền ${permission.name} này không ?`}
                                    onConfirm={() => handleDelete(permission)}
                                    trigger={
                                      <span>
                                        <ToolTip
                                          title={`Xóa ${permission.name}`}
                                        >
                                          <Button className='h-5 border-none bg-transparent p-0! shadow-none hover:bg-transparent'>
                                            <AiOutlineDelete className='text-destructive size-3.5' />
                                          </Button>
                                        </ToolTip>
                                      </span>
                                    }
                                  />
                                  <MediaQuery maxWidth={1560}>
                                    {(index + 1) % 3 !== 0 && (
                                      <Separator
                                        orientation='vertical'
                                        className='ml-2 h-4! bg-gray-200'
                                      />
                                    )}
                                  </MediaQuery>
                                  <MediaQuery minWidth={1560}>
                                    {(index + 1) % 4 !== 0 && (
                                      <Separator
                                        orientation='vertical'
                                        className='h-4! bg-gray-200'
                                      />
                                    )}
                                  </MediaQuery>
                                </div>
                              </div>
                              <span className='text-xs'>
                                ({permission.permissionCode})
                              </span>
                            </div>
                          );
                        })
                    ) : (
                      <NoData
                        content='Không có dữ liệu'
                        className='min-h-[30vh] [&_img]:w-40'
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ListPageWrapper>
      <PermissionModal
        open={opened}
        selectedRow={selectedRow}
        selectedGroupPermissionId={selectedGroupPermissionId}
        onClose={handleClose}
      />
    </>
  );
}
