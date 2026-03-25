'use client';

import { Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import { apiConfig, groupPermissionErrorMaps } from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { groupPermissionSchema } from '@/schemaValidations';
import {
  ApiResponse,
  GroupPermissionBodyType,
  GroupPermissionResType
} from '@/types';
import { applyFormErrors } from '@/utils';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function GroupPermissionModal({
  open,
  queryKey,
  selectedRow,
  onClose
}: {
  open: boolean;
  queryKey: string;
  selectedRow: GroupPermissionResType | null;
  onClose: () => void;
}) {
  const {
    isEditing,
    isFormChanged,
    onFormChange,
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

  const defaultValues: GroupPermissionBodyType = {
    name: ''
  };

  const initialValues: GroupPermissionBodyType = useMemo(
    () => ({
      name: selectedRow?.name || ''
    }),
    [selectedRow?.name]
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
        handleClose();
      } else {
        const errCode = res.code;
        if (errCode) applyFormErrors(form, errCode, groupPermissionErrorMaps);
      }
    } catch (error) {
      logger.error('Error while creating/updating:', error);
    }
  };

  const handleClose = () => {
    onFormChange(false);
    onClose();
  };

  return (
    <Modal
      title={`${!isEditing ? 'Thêm' : 'Cập nhật'} nhóm quyền`}
      open={open}
      onClose={handleClose}
      bodyWrapperClassName='w-200 max-[1537px]:w-175 max-[1367px]:w-150 top-1/3'
      confirmOnClose={isFormChanged}
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={groupPermissionSchema}
        onFormChange={onFormChange}
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
  );
}
