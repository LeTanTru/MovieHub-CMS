'use client';

import { Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { apiConfig, groupPermissionErrorMaps, queryKeys } from '@/constants';
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
  selectedRow,
  onClose
}: {
  open: boolean;
  selectedRow: GroupPermissionResType | null;
  onClose: () => void;
}) {
  const {
    loading,
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<GroupPermissionResType, GroupPermissionBodyType>({
    apiConfig: apiConfig.groupPermission,
    options: {
      queryKey: queryKeys.GROUP_PERMISSION,
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
      bodyWrapperClassName='w-200 max-[1537px]:w-175 max-[1367px]:w-150 top-1/3 overflow-hidden'
      confirmOnClose={isFormChanged}
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={groupPermissionSchema}
        onFormChange={onFormChange}
        className='rounded-none'
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-12'>
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
            {loading && (
              <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                <CircleLoading className='stroke-main-color mt-10' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </Modal>
  );
}
