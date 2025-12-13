'use client';

import {
  BooleanField,
  Col,
  InputField,
  NumberField,
  Row,
  UploadFileField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { apiConfig, appVersionErrorMaps, ErrorCode } from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { useDeleteFileMutation, useUploadFileMutation } from '@/queries';
import { route } from '@/routes';
import { appVersionSchema } from '@/schemaValidations';
import { AppVersionBodyType, AppVersionResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { AxiosProgressEvent } from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function AppVersionForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();
  const [filePath, setFilePath] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const uploadFileMutation = useUploadFileMutation();
  const deleteImageMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<AppVersionResType, AppVersionBodyType>({
    apiConfig: apiConfig.appVersion,
    options: {
      queryKey,
      objectName: 'phiên bản ứng dụng',
      listPageUrl: route.appVersion.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: AppVersionBodyType = {
    name: '',
    changeLog: '',
    code: 0,
    filePath: '',
    forceUpdate: false,
    isLatest: false
  };

  const initialValues: AppVersionBodyType = useMemo(() => {
    return {
      name: data?.name ?? '',
      changeLog: data?.changeLog ?? '',
      code: data?.code ?? 0,
      filePath: data?.filePath ?? '',
      forceUpdate: data?.forceUpdate ?? false,
      isLatest: data?.isLatest ?? false
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
      ? uploadedFiles.slice(uploadedFiles.length - 1)
      : uploadedFiles;
    await deleteFiles(filesToDelete);
  };

  const onSubmit = async (
    values: AppVersionBodyType,
    form: UseFormReturn<AppVersionBodyType>
  ) => {
    const filesToDelete =
      data?.filePath && !filePath
        ? uploadedFiles
        : uploadedFiles.slice(0, uploadedFiles.length - 1);

    await deleteFiles(filesToDelete.filter(Boolean));

    await handleSubmit(
      {
        ...values,
        filePath: filePath
      },
      form,
      appVersionErrorMaps
    );
  };

  useEffect(() => {
    const url = data?.filePath || '';
    setFilePath(url);
    setUploadedFiles(url ? [url] : []);
  }, [data?.filePath]);

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
      notFoundContent={'Không tìm thấy phiên bản ứng dụng này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={appVersionSchema}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <UploadFileField
                  control={form.control}
                  name='filePath'
                  uploadFileFn={async (file: Blob, onProgress) => {
                    const res = await uploadFileMutation.mutateAsync({
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
                  onChange={(url) => {
                    setFilePath(url);
                    setUploadedFiles((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  deleteImageFn={
                    data?.filePath
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: filePath
                          })
                  }
                  label='Chọn tệp (.apk)'
                  accept='.apk'
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên phiên bản'
                  placeholder='Tên phiên bản'
                  required
                />
              </Col>
              <Col>
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
              <Col>
                <InputField
                  control={form.control}
                  name='changeLog'
                  label='Nhật ký thay đổi'
                  placeholder='Nhật ký thay đổi'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <BooleanField
                  control={form.control}
                  name='forceUpdate'
                  label='Bắt buộc cập nhật'
                  required
                />
              </Col>
              <Col>
                <BooleanField
                  control={form.control}
                  name='isLatest'
                  label='Phiên bản mới nhất'
                  required
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
