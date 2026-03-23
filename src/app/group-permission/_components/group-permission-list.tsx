'use client';

import { Button, Col, InputField, Row, ToolTip } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { Modal } from '@/components/modal';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  groupPermissionErrorMaps,
  MAX_PAGE_SIZE
} from '@/constants';
import { useDisclosure, useDragDrop, useListBase, useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { groupPermissionSchema } from '@/schemaValidations';
import type {
  ApiResponse,
  Column,
  GroupPermissionBodyType,
  GroupPermissionResType,
  GroupPermissionSearchType
} from '@/types';
import { applyFormErrors } from '@/utils';
import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { AiOutlineEdit } from 'react-icons/ai';

export default function GroupPermissionList({
  queryKey
}: {
  queryKey: string;
}) {
  const { opened, open, close } = useDisclosure(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<
    GroupPermissionResType | null | undefined
  >(null);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const {
    data: groupPermissionList,
    loading: groupPermissionListLoading,
    handlers,
    listQuery
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
              <ToolTip title={`Cập nhật nhóm quyền`}>
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
    data: groupPermission,
    handleSubmit,
    renderActions
  } = useSaveBase<GroupPermissionResType, GroupPermissionBodyType>({
    apiConfig: apiConfig.groupPermission,
    options: {
      queryKey,
      objectName: 'nhóm quyền',
      pathParams: {
        id: selectedRow?.id
      },
      mode: selectedRow === null ? 'create' : 'edit'
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
    setIsEditing(false);
    open();
    setSelectedRow(null);
  };

  const handleClose = () => {
    close();
  };

  const handleEditClick = (record: GroupPermissionResType) => {
    setIsEditing(true);
    open();
    setSelectedRow(record);
  };

  useEffect(() => {
    if (groupPermission) setSelectedRow(groupPermission);
  }, [groupPermission]);

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

  const defaultValues: GroupPermissionBodyType = {
    name: '',
    ordering: groupPermissionList.length
  };
  const initialValues: GroupPermissionBodyType = useMemo(
    () => ({
      name: selectedRow?.name || '',
      ordering: groupPermissionList.length
    }),
    [groupPermissionList.length, selectedRow?.name]
  );

  const onSubmit = async (
    values: GroupPermissionBodyType,
    form: UseFormReturn<GroupPermissionBodyType>
  ) => {
    try {
      const res: ApiResponse<any> = await handleSubmit(
        !isEditing ? values : { ...values, id: selectedRow?.id }
      );
      if (res.result) {
        listQuery.refetch();
        handleClose();
      } else {
        const errCode = res.code;
        if (errCode) applyFormErrors(form, errCode, groupPermissionErrorMaps);
      }
    } catch (error) {
      logger.error('Error while creating/updating:', error);
    }
  };

  return (
    <>
      <ListPageWrapper
        addButton={
          <HasPermission
            requiredPermissions={[
              apiConfig.groupPermission.create.permissionCode
            ]}
          >
            <Button onClick={handleAdd} variant={'primary'}>
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
      <Modal
        title={`${!isEditing ? 'Thêm' : 'Cập nhật'} nhóm quyền`}
        open={opened}
        onClose={handleClose}
        bodyWrapperClassName='w-200 max-[1537px]:w-175 max-[1367px]:w-150 top-1/3'
        confirmOnClose={isFormChanged}
      >
        <BaseForm
          defaultValues={defaultValues}
          initialValues={initialValues}
          onSubmit={onSubmit}
          schema={groupPermissionSchema}
          onFormChange={setIsFormChanged}
        >
          {(form) => (
            <>
              <Row>
                <Col span={24}>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên nhóm quyền'
                    placeholder='Nhập tên nhóm quyền...'
                    required
                  />
                </Col>
              </Row>
              <>
                {renderActions(form, {
                  onCancel: handleClose
                })}
              </>
            </>
          )}
        </BaseForm>
      </Modal>
    </>
  );
}
