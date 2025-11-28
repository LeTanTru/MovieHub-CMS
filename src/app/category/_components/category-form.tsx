'use client';

import { Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  categoryErrorMaps,
  ErrorCode,
  STATUS_ACTIVE
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { route } from '@/routes';
import { categorySchema } from '@/schemaValidations';
import { CategoryBodyType, CategoryResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function CategoryForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<CategoryResType, CategoryBodyType>({
    apiConfig: apiConfig.category,
    options: {
      queryKey,
      objectName: 'danh mục',
      listPageUrl: route.category.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
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
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Danh mục',
          href: renderListPageUrl(route.category.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} danh mục` }
      ]}
      notFound={responseCode === ErrorCode.CATEGORY_ERROR_NOT_FOUND}
      notFoundContent={'Không tìm thấy danh mục này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={categorySchema}
        initialValues={initialValues}
        className='w-1/2!'
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

            <>{renderActions(form)}</>
            {loading && (
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
