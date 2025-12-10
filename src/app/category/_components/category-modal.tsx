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
import { CategoryBodyType, CategoryResType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function CategoryModal({
  open,
  category,
  close
}: {
  open: boolean;
  category: CategoryResType | null;
  close: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, loading, isEditing, handleSubmit, renderActions } = useSaveBase<
    CategoryResType,
    CategoryBodyType
  >({
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
        close();
        queryClient.invalidateQueries({
          queryKey: [`${queryKeys.CATEGORY}-list`]
        });
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
      onClose={close}
      title={`${!isEditing ? 'Thêm mới' : 'Cập nhật'} danh mục`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={categorySchema}
        initialValues={initialValues}
        className='w-175 p-0'
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
                onCancel: close
              })}
            </>
            {loading && (
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </Modal>
  );
}
