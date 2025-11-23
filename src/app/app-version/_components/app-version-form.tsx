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
import { useUploadFileMutation } from '@/queries';
import { route } from '@/routes';
import { appVersionSchema } from '@/schemaValidations';
import { AppVersionBodyType, AppVersionResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function AppVersionForm({ queryKey }: { queryKey: string }) {
  const [filePath, setFilePath] = useState<string>('');
  const { id } = useParams<{ id: string }>();

  const uploadFileMutation = useUploadFileMutation();

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

  const onSubmit = async (
    values: AppVersionBodyType,
    form: UseFormReturn<AppVersionBodyType>
  ) => {
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
    if (data?.filePath) {
      setFilePath(data?.filePath);
    }
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
                  uploadFileFn={async (file: Blob) => {
                    const res = await uploadFileMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  onChange={(url) => setFilePath(url)}
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
