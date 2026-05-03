'use client';

import {
  Col,
  InputField,
  NumberField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  ErrorCode,
  objectNames,
  queryKeys,
  serverConfigErrorMaps,
  serverConfigStatusOptions,
  STATUS_ACTIVE,
  STATUS_PENDING
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { route } from '@/routes';
import { serverConfigSchema } from '@/schemaValidations';
import { ServerConfigBodyType, ServerConfigResType } from '@/types';
import { notify, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function ServerConfigForm() {
  const { id } = useParams<{ id: string }>();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<ServerConfigResType, ServerConfigBodyType>({
    apiConfig: apiConfig.serverConfig,
    options: {
      queryKey: queryKeys.SERVER_CONFIG,
      objectName: objectNames.SERVER_CONFIG,
      listPageUrl: route.serverConfig.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitError = (code) => {
        const errorMap = serverConfigErrorMaps[code];
        if (errorMap) {
          const message = errorMap[0][1].message;
          notify.error(message);
        }
      };
    }
  });

  const defaultValues: ServerConfigBodyType = {
    hostname: '',
    ip: '',
    name: '',
    port: 0,
    serverNumber: 0,
    status: STATUS_ACTIVE
  };

  const initialValues: ServerConfigBodyType = useMemo(
    () => ({
      hostname: data?.hostname ?? '',
      ip: data?.ip ?? '',
      name: data?.name ?? '',
      port: data?.port ?? 0,
      serverNumber: data?.serverNumber ?? 0,
      status: data?.status ?? STATUS_ACTIVE
    }),
    [
      data?.hostname,
      data?.ip,
      data?.name,
      data?.port,
      data?.serverNumber,
      data?.status
    ]
  );

  const statusOptions = useMemo(
    () =>
      isEditing
        ? serverConfigStatusOptions.filter(
            (opt) => opt.value !== STATUS_PENDING
          )
        : serverConfigStatusOptions,
    [isEditing]
  );

  const onSubmit = async (
    values: ServerConfigBodyType,
    form: UseFormReturn<ServerConfigBodyType>
  ) => {
    await handleSubmit(values, form, serverConfigErrorMaps);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Máy chủ',
          href: renderListPageUrl(route.serverConfig.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} máy chủ`
        }
      ]}
      notFound={responseCode === ErrorCode.SERVER_CONFIG_ERROR_NOT_FOUND}
      notFoundContent={`Không tìm thấy server này`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={serverConfigSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên'
                  placeholder='Tên'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='hostname'
                  label='Hostname'
                  placeholder='Hostname'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='ip'
                  label='IP'
                  placeholder='IP'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <NumberField
                  control={form.control}
                  name='port'
                  label='Cổng'
                  placeholder='Cổng'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <NumberField
                  control={form.control}
                  name='serverNumber'
                  label='Máy chủ No.'
                  placeholder='Máy chủ No.'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <SelectField
                  control={form.control}
                  name='status'
                  label='Trạng thái'
                  placeholder='Trạng thái'
                  required
                  options={statusOptions}
                />
              </Col>
            </Row>
            <>{renderActions(form)}</>
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
