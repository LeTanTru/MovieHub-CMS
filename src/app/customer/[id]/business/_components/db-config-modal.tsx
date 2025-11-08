'use client';

import {
  BooleanField,
  Col,
  FieldSet,
  InputField,
  NumberField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  apiConfig,
  dbConfigErrorMaps,
  queryKeys,
  serverProviderErrorMaps
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { useServerProviderListQuery } from '@/queries';
import { dbConfigSchema } from '@/schemaValidations';
import { DbConfigBodyType, DbConfigResType, BusinessResType } from '@/types';
import { notify } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function DbConfigModal({
  data,
  open,
  onClose
}: {
  data: BusinessResType | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const serverProviderListQuery = useServerProviderListQuery({ enabled: open });
  const serverProviderList =
    serverProviderListQuery.data?.data?.content?.map((item) => ({
      label: item.name,
      value: item.id.toString()
    })) || [];

  const {
    data: dbConfig,
    isEditing,
    renderActions,
    handleSubmit
  } = useSaveBase<DbConfigResType, DbConfigBodyType>({
    apiConfig: {
      ...apiConfig.dbConfig,
      getById: apiConfig.dbConfig.getByBusinessId
    },
    options: {
      objectName: 'cấu hình cơ sở dữ liệu',
      queryKey: queryKeys.DB_CONFIG,
      enabled: open,
      pathParams: {
        businessId: data?.id
      },
      mode: data?.serverProviderDto ? 'edit' : 'create'
    }
  });

  const parseUrl = (url: string) => {
    if (url) {
      const pattern = /^jdbc:mysql:\/\/([^:/]+):(\d+)\/([^?]+)/;
      const match = url.match(pattern);
      if (!match) return { host: '', port: 3306, dbName: '' };
      const [, host, port, dbName] = match;

      return { host, port: +port, dbName };
    }
    return { host: '', port: 3306, dbName: '' };
  };

  const dbInfo = parseUrl(dbConfig?.url ?? '');

  const defaultValues: DbConfigBodyType = {
    businessId: data?.id ?? '',
    driverClassName: '',
    initialize: false,
    maxConnection: 0,
    serverProviderId: '',
    host: '',
    port: 3306
  };

  const initialValues: DbConfigBodyType = useMemo(() => {
    return {
      businessId: data?.id?.toString() ?? '',
      driverClassName: dbConfig?.driverClassName ?? '',
      initialize: dbConfig?.initialize ?? false,
      maxConnection: dbConfig?.maxConnection ?? 0,
      serverProviderId: dbConfig?.serverProvider?.id?.toString() ?? '',
      host: dbInfo?.host,
      port: dbInfo?.port
    };
  }, [dbConfig, data?.id]);

  const onSubmit = async (
    values: DbConfigBodyType,
    form: UseFormReturn<DbConfigBodyType>
  ) => {
    try {
      const res = await handleSubmit({ ...values }, form, dbConfigErrorMaps);
      if (res.result) {
        queryClient.invalidateQueries({
          queryKey: [`${queryKeys.BUSINESS}-list`]
        });
        onClose();
      } else {
        const errorCode = res.code;
        if (errorCode) {
          const error = serverProviderErrorMaps[errorCode];
          if (error) {
            const errMsg = error[0][1].message;
            notify.error(errMsg);
          }
        }
      }
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card className='w-200 bg-white'>
        <CardHeader className='flex flex-row items-center justify-between p-4'>
          <CardTitle className='mb-0 font-normal'>{`Cấu hình cơ sở dữ liệu`}</CardTitle>
          <X
            onClick={onClose}
            className='cursor-pointer transition-all duration-200 ease-linear hover:opacity-80'
          />
        </CardHeader>
        <CardContent className='p-4 pt-0'>
          <FieldSet
            title={`${!isEditing ? 'Thêm' : 'Cập nhật'} cấu hình cơ sở dữ liệu`}
          >
            <BaseForm
              schema={dbConfigSchema}
              defaultValues={defaultValues}
              initialValues={initialValues}
              onSubmit={onSubmit}
              className='w-full p-0'
            >
              {(form) => (
                <>
                  <Row>
                    <Col>
                      <InputField
                        control={form.control}
                        name='host'
                        label='Máy chủ'
                        placeholder='Máy chủ'
                        required
                        disabled={isEditing}
                      />
                    </Col>
                    <Col>
                      <InputField
                        control={form.control}
                        name='driverClassName'
                        label='Driver class name'
                        placeholder='Driver class name'
                        required
                        disabled={isEditing}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <InputField
                        control={form.control}
                        name='port'
                        label='Cổng'
                        placeholder='Cổng'
                        required
                        disabled={isEditing}
                      />
                    </Col>
                    <Col>
                      <NumberField
                        control={form.control}
                        name='maxConnection'
                        label='Số kết nối tối đa'
                        placeholder='Số kết nối tối đa'
                        required
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SelectField
                        control={form.control}
                        name='serverProviderId'
                        label='Nhà cung cấp máy chủ'
                        placeholder='Nhà cung cấp máy chủ'
                        required
                        disabled={isEditing}
                        options={serverProviderList}
                        getLabel={(opt) => opt.label}
                        getValue={(opt) => opt.value}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <BooleanField
                        control={form.control}
                        name='initialize'
                        label='Khởi tạo'
                      />
                    </Col>
                  </Row>
                  <>{renderActions(form, { onCancel: onClose })}</>
                </>
              )}
            </BaseForm>
          </FieldSet>
        </CardContent>
      </Card>
    </Modal>
  );
}
