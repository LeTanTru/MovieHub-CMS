'use client';

import { Activity } from '@/components/activity';
import { Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  categoryErrorMaps,
  queryKeys,
  STATUS_ACTIVE
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { categorySchema } from '@/schemaValidations';
import type { CategoryBodyType, CategoryResType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function CategoryModal({
  open,
  category,
  onClose
}: {
  open: boolean;
  category: CategoryResType | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, loading, isEditing, itemQuery, handleSubmit, renderActions } =
    useSaveBase<CategoryResType, CategoryBodyType>({
      apiConfig: apiConfig.category,
      options: {
        queryKey: queryKeys.CATEGORY,
        objectName: 'danh mục',
        pathParams: {
          id: category?.id
        },
        mode: !category ? 'create' : 'edit'
      },
      override: (handlers) => {
        handlers.handleSubmitSuccess = () => {
          onClose();
          queryClient.invalidateQueries({
            queryKey: [`${queryKeys.CATEGORY}-list`]
          });
          itemQuery.refetch();
        };
      }
    });

  const defaultValues: CategoryBodyType = {
    name: '',
    status: STATUS_ACTIVE
  };

  const initialValues: CategoryBodyType = useMemo(() => {
    return {
      name: data?.name ?? '',
      status: STATUS_ACTIVE
    };
  }, [data]);

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${!isEditing ? 'Thêm mới' : 'Cập nhật'} danh mục`}
      className='[&_.content]:bottom-[20%] [&_.content]:h-fit'
      aria-labelledby='video-modal-title'
      width={700}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={categorySchema}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên danh mục'
                  placeholder='Tên danh mục'
                  required
                />
              </Col>
            </Row>

            <>
              {renderActions(form, {
                onCancel: onClose
              })}
            </>
            <Activity visible={loading}>
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            </Activity>
          </>
        )}
      </BaseForm>
    </Modal>
  );
}
