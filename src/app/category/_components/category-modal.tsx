'use client';

import { Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  categoryErrorMaps,
  objectNames,
  queryKeys,
  STATUS_ACTIVE
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { categorySchema } from '@/schemaValidations';
import type { CategoryBodyType, CategoryResType } from '@/types';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const defaultValues: CategoryBodyType = {
  name: '',
  status: STATUS_ACTIVE
};

type CategoryModalProps = {
  open: boolean;
  category: CategoryResType | null;
  onClose: () => void;
};

export function CategoryModal({ open, category, onClose }: CategoryModalProps) {
  const {
    data,
    loading,
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<CategoryResType, CategoryBodyType>({
    apiConfig: apiConfig.category,
    options: {
      queryKey: queryKeys.CATEGORY,
      objectName: objectNames.CATEGORY,
      pathParams: {
        id: category?.id ?? ''
      },
      mode: !category ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        onClose();
      };
    }
  });

  const initialValues: CategoryBodyType = useMemo(
    () => ({
      name: data?.name ?? defaultValues.name,
      status: data?.status ?? defaultValues.status
    }),
    [data?.name, data?.status]
  );

  const onSubmit = async (
    values: CategoryBodyType,
    form: UseFormReturn<CategoryBodyType>
  ) => {
    await handleSubmit(
      {
        ...values
      },
      form,
      categoryErrorMaps
    );
  };

  const handleCancel = () => {
    onClose();
    onFormChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='category-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>
        {`${!isEditing ? 'Thêm mới' : 'Cập nhật'} thể loại`}
      </Modal.Header>
      <Modal.Body>
        <BaseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          schema={categorySchema}
          initialValues={initialValues}
          onFormChange={onFormChange}
        >
          {(form) => (
            <>
              <Row>
                <Col className='grid-c-12'>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên thể loại'
                    placeholder='Tên thể loại'
                    required
                  />
                </Col>
              </Row>

              <>
                {renderActions(form, {
                  onCancel: handleCancel
                })}
              </>
              {loading && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-sporty-blue mt-10' />
                </div>
              )}
            </>
          )}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
