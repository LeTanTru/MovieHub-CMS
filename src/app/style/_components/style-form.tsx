'use client';

import {
  BooleanField,
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
import { apiConfig, ErrorCode, styleErrorMaps } from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { styleSchema } from '@/schemaValidations';
import { StyleBodyType, StyleResType } from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function StyleForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const uploadImageMutation = useUploadLogoMutation();
  const deleteImageMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<StyleResType, StyleBodyType>({
    apiConfig: apiConfig.style,
    options: {
      queryKey,
      objectName: 'thiết kế',
      listPageUrl: route.style.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: StyleBodyType = {
    description: '',
    imageUrl: '',
    isDefault: false,
    name: '',
    type: 1
  };

  const initialValues: StyleBodyType = useMemo(() => {
    return {
      description: data?.description ?? '',
      imageUrl: data?.imageUrl ?? '',
      isDefault: data?.isDefault ?? false,
      name: data?.name ?? '',
      type: data?.type ?? 1
    };
  }, [data]);

  const deleteFiles = async (files: string[]) => {
    const validFiles = files.filter(Boolean);
    if (!validFiles.length) return;
    await Promise.all(
      validFiles.map((filePath) =>
        deleteImageMutation.mutateAsync({ filePath }).catch((err) => {
          logger.error('Failed to delete file:', filePath, err);
        })
      )
    );
  };

  const handleDeleteFiles = async () => {
    const filesToDelete = isEditing
      ? uploadedImages.slice(uploadedImages.length - 1)
      : uploadedImages;
    await deleteFiles(filesToDelete);
  };

  const onSubmit = async (
    values: StyleBodyType,
    form: UseFormReturn<StyleBodyType>
  ) => {
    const filesToDelete =
      data?.imageUrl && !imageUrl
        ? uploadedImages
        : uploadedImages.slice(0, uploadedImages.length - 1);

    await deleteFiles(filesToDelete.filter(Boolean));

    await handleSubmit(
      {
        ...values,
        imageUrl: imageUrl
      },
      form,
      styleErrorMaps
    );
  };

  useEffect(() => {
    const url = data?.imageUrl || '';

    setImageUrl(url);
    setUploadedImages(url ? [url] : []);
  }, [data?.imageUrl]);

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
      notFoundContent={'Không tìm thấy thiết kế này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={styleSchema}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <UploadImageField
                  value={renderImageUrl(imageUrl)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='imageUrl'
                  onChange={(url) => {
                    setImageUrl(url);
                    setUploadedImages((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={
                    data?.imageUrl
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: imageUrl
                          })
                  }
                  label='Ảnh bìa'
                  aspect={2 / 3}
                  required
                  defaultCrop
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên thiết kế'
                  placeholder='Tên thiết kế'
                  required
                />
              </Col>
              <Col>
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
              <Col>
                <BooleanField
                  control={form.control}
                  name='isDefault'
                  label='Mặc định'
                  required
                  labelClassName='ml-2'
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
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
                onCancel: handleDeleteFiles
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
    </PageWrapper>
  );
}
