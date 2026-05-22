'use client';

import {
  CheckboxField,
  Col,
  InputField,
  NumberField,
  Row,
  UploadFileField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  appVersionErrorMaps,
  ErrorCode,
  objectNames,
  queryKeys
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { useDeleteFileMutation, useUploadFileMutation } from '@/queries';
import { route } from '@/routes';
import { appVersionSchema } from '@/schemaValidations';
import type { AppVersionBodyType, AppVersionResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import type { AxiosProgressEvent } from 'axios';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export function AppVersionForm() {
  const { id } = useParams<{ id: string }>();

  const { mutateAsync: uploadFileMutate } = useUploadFileMutation();
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
  } = useSaveBase<AppVersionResType, AppVersionBodyType>({
    apiConfig: apiConfig.appVersion,
    options: {
      queryKey: queryKeys.APP_VERSION,
      objectName: objectNames.APP_VERSION,
      listPageUrl: route.appVersion.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.filePath,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const isUploading = imageManager.isUploading;

  const defaultValues: AppVersionBodyType = {
    name: '',
    changeLog: '',
    code: 0,
    filePath: '',
    forceUpdate: false,
    isLatest: false
  };

  const initialValues: AppVersionBodyType = useMemo(
    () => ({
      name: data?.name ?? '',
      changeLog: data?.changeLog ?? '',
      code: data?.code ?? 0,
      filePath: data?.filePath ?? '',
      forceUpdate: data?.forceUpdate ?? false,
      isLatest: data?.isLatest ?? false
    }),
    [
      data?.changeLog,
      data?.code,
      data?.filePath,
      data?.forceUpdate,
      data?.isLatest,
      data?.name
    ]
  );

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (
    values: AppVersionBodyType,
    form: UseFormReturn<AppVersionBodyType>
  ) => {
    await Promise.all([
      imageManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          filePath: imageManager.currentUrl
        },
        form,
        appVersionErrorMaps
      )
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phiên bản ứng dụng',
          href: renderListPageUrl(route.appVersion.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} phiên bản ứng dụng` }
      ]}
      notFound={responseCode === ErrorCode.APP_VERSION_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy phiên bản ứng dụng này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={appVersionSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-12'>
                <UploadFileField
                  control={form.control}
                  name='filePath'
                  uploadFileFn={async (file, onProgress) => {
                    const res = await uploadFileMutate({
                      file,
                      options: {
                        onUploadProgress: (e: AxiosProgressEvent) => {
                          const percent = Math.round(
                            (e.loaded * 100) / (e.total ?? 1)
                          );
                          logger.info(`Upload video: ${percent}%`);
                          onProgress(percent);
                        }
                      }
                    });
                    return res.data?.filePath ?? '';
                  }}
                  onChange={imageManager.trackUpload}
                  onUploadStart={imageManager.trackUploadStart}
                  deleteImageFn={imageManager.handleDeleteOnClick}
                  label='Chọn tệp (.apk)'
                  accept='.apk'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên phiên bản'
                  placeholder='Tên phiên bản'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <NumberField
                  control={form.control}
                  name='code'
                  label='Mã phiên bản'
                  placeholder='Mã phiên bản'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='changeLog'
                  label='Nhật ký thay đổi'
                  placeholder='Nhật ký thay đổi'
                  required
                />
              </Col>
              <Col className='grid-c-6 justify-end'>
                <Row className='mb-3'>
                  <Col className='grid-c-6'>
                    <CheckboxField
                      control={form.control}
                      name='forceUpdate'
                      label='Bắt buộc cập nhật'
                      required
                    />
                  </Col>
                  <Col className='grid-c-6'>
                    <CheckboxField
                      control={form.control}
                      name='isLatest'
                      label='Phiên bản mới nhất'
                      required
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <>
              {renderActions(form, {
                onCancel: handleCancel,
                disabled: isUploading
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
