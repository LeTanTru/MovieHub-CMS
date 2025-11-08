'use client';

import { Col, FieldSet, InputField, NumberField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { apiConfig, serverProviderErrorMaps, STATUS_ACTIVE } from '@/constants';
import { useSaveBase } from '@/hooks';
import { route } from '@/routes';
import { serverProviderSchema } from '@/schemaValidations';
import { ServerProviderBodyType, ServerProviderResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { omit } from 'lodash';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function ServerProviderForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();

  const { data, loading, isEditing, queryString, handleSubmit, renderActions } =
    useSaveBase<ServerProviderResType, ServerProviderBodyType>({
      apiConfig: apiConfig.serverProvider,
      options: {
        queryKey,
        objectName: 'máy chủ',
        listPageUrl: route.serverProvider.getList.path,
        pathParams: {
          id
        },
        mode: id === 'create' ? 'create' : 'edit'
      }
    });

  const parseJdbcUrl = (url: string) => {
    const regex = /^jdbc:mysql:\/\/([^:]+):(\d+)$/;
    const match = url.match(regex);

    if (match) {
      const host = match[1];
      const port = match[2];
      return { host, port: +port };
    } else {
      return { host: '', port: 3306 };
    }
  };

  const buildJdbcUrl = (host: string, port: number) => {
    const jdbcUrl = `jdbc:mysql://${host}:${port}`;
    return jdbcUrl;
  };

  const jdbcUrlInfo = parseJdbcUrl(data?.mySqlJdbcUrl ?? '');

  const defaultValues: ServerProviderBodyType = {
    driverClassName: '',
    maxTenant: 0,
    mySqlJdbcUrl: '',
    mySqlRootPassword: '',
    mySqlRootUser: '',
    name: '',
    status: STATUS_ACTIVE,
    url: '',
    host: '',
    port: 3306
  };

  const initialValues: ServerProviderBodyType = useMemo(() => {
    return {
      driverClassName: data?.driverClassName ?? '',
      maxTenant: data?.maxTenant ?? 0,
      mySqlJdbcUrl: data?.mySqlJdbcUrl ?? '',
      mySqlRootPassword: data?.mySqlRootPassword ?? '',
      mySqlRootUser: data?.mySqlRootUser ?? '',
      name: data?.name ?? '',
      status: STATUS_ACTIVE,
      url: data?.url ?? '',
      host: jdbcUrlInfo.host,
      port: jdbcUrlInfo.port
    };
  }, [data]);

  const onSubmit = async (
    values: ServerProviderBodyType,
    form: UseFormReturn<ServerProviderBodyType>
  ) => {
    const payload = omit(
      {
        ...values,
        url: buildJdbcUrl(values.host, values.port)
      },
      ['host', 'port']
    );
    await handleSubmit(payload as any, form, serverProviderErrorMaps);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Máy chủ',
          href: renderListPageUrl(
            route.serverProvider.getList.path,
            queryString
          )
        },
        { label: `${!data ? 'Thêm mới' : 'Cập nhật'} máy chủ` }
      ]}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={serverProviderSchema}
        initialValues={initialValues}
        className='w-200'
      >
        {(form) => (
          <>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên máy chủ'
                  placeholder='Tên máy chủ'
                  required
                  disabled={isEditing}
                />
              </Col>
            </Row>
            <FieldSet title='Thông tin máy chủ'>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='url'
                    label='Api Url'
                    placeholder='Họ tên khách hàng'
                    required
                  />
                </Col>
                <Col>
                  <NumberField
                    control={form.control}
                    name='maxTenant'
                    label='Số lượng tối đa'
                    placeholder='Số lượng tối đa'
                    required
                  />
                </Col>
              </Row>
            </FieldSet>
            <FieldSet title='Thông tin MySQL'>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='host'
                    label='Máy chủ'
                    placeholder='Máy chủ'
                    required
                  />
                </Col>
                <Col>
                  <InputField
                    control={form.control}
                    name='port'
                    label='Cổng'
                    placeholder='Cổng'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='mySqlRootUser'
                    label='Tên đăng nhập MySQL'
                    placeholder='Tên đăng nhập MySQL'
                    required
                  />
                </Col>
                <Col>
                  <InputField
                    control={form.control}
                    name='mySqlRootPassword'
                    label='Mật khẩu MySQL'
                    placeholder='Mật khẩu MySQL'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='driverClassName'
                    label='Driver'
                    placeholder='Driver'
                    required
                  />
                </Col>
              </Row>
            </FieldSet>
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
