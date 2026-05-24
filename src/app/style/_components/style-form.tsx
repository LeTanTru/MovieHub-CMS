'use client';

import {
  CheckboxField,
  Col,
  InputField,
  NumberField,
  RichTextField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  ErrorCode,
  objectNames,
  queryKeys,
  styleErrorMaps
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { styleSchema } from '@/schemaValidations';
import type { StyleBodyType, StyleResType } from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export function StyleForm() {
  const { id } = useParams<{ id: string }>();

  const { mutateAsync: uploadImageMutate, isPending: uploadImageLoading } =
    useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<StyleResType, StyleBodyType>({
    apiConfig: apiConfig.style,
    options: {
      queryKey: queryKeys.STYLE,
      objectName: objectNames.STYLE,
      listPageUrl: route.style.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageMobileManager = useFileUploadManager({
    initialUrl: data?.imageMobileUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const imageWebManager = useFileUploadManager({
    initialUrl: data?.imageWebUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const defaultValues: StyleBodyType = {
    description: '',
    imageMobileUrl: '',
    imageWebUrl: '',
    isDefault: false,
    name: '',
    type: 1
  };

  const initialValues: StyleBodyType = useMemo(
    () => ({
      description: data?.description ?? '',
      imageMobileUrl: data?.imageMobileUrl ?? '',
      imageWebUrl: data?.imageWebUrl ?? '',
      isDefault: data?.isDefault ?? false,
      name: data?.name ?? '',
      type: data?.type ?? 1
    }),
    [
      data?.description,
      data?.imageMobileUrl,
      data?.imageWebUrl,
      data?.isDefault,
      data?.name,
      data?.type
    ]
  );

  const handleCancel = async () => {
    await Promise.all([
      imageMobileManager.handleCancel(),
      imageWebManager.handleCancel()
    ]);
  };

  const onSubmit = async (
    values: StyleBodyType,
    form: UseFormReturn<StyleBodyType>
  ) => {
    await Promise.all([
      imageMobileManager.handleSubmit(),
      imageWebManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          imageMobileUrl: imageMobileManager.currentUrl,
          imageWebUrl: imageWebManager.currentUrl
        },
        form,
        styleErrorMaps
      )
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Thiết kế',
          href: renderListPageUrl(route.style.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} thiết kế` }
      ]}
      notFound={responseCode === ErrorCode.STYLE_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy thiết kế này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={styleSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-6'>
                <UploadImageField
                  value={renderImageUrl(imageMobileManager.currentUrl)}
                  loading={uploadImageLoading}
                  control={form.control}
                  name='imageMobileUrl'
                  onChange={imageMobileManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file) => {
                    const res = await uploadImageMutate({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={imageMobileManager.handleDeleteOnClick}
                  label='Ảnh mobile (2:3)'
                  required
                  originalSize
                  aspect={2 / 3}
                  defaultCrop
                />
              </Col>
              <Col className='grid-c-6'>
                <UploadImageField
                  value={renderImageUrl(imageWebManager.currentUrl)}
                  loading={uploadImageLoading}
                  control={form.control}
                  name='imageWebUrl'
                  onChange={imageWebManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file) => {
                    const res = await uploadImageMutate({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={imageWebManager.handleDeleteOnClick}
                  label='Ảnh web (16:9)'
                  required
                  originalSize
                  aspect={16 / 9}
                  defaultCrop
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên thiết kế'
                  placeholder='Tên thiết kế'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <NumberField
                  control={form.control}
                  name='type'
                  label='Loại'
                  placeholder='Loại'
                  required
                  min={1}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <CheckboxField
                  control={form.control}
                  name='isDefault'
                  label='Mặc định'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-12'>
                <RichTextField
                  control={form.control}
                  name='description'
                  label='Mô tả'
                  required
                  placeholder='Mô tả'
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
                <CircleLoading className='stroke-main-color mt-20' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
