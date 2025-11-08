'use client';

import {
  AutoCompleteField,
  Col,
  DateTimePickerField,
  InputField,
  Row,
  SelectField,
  TextAreaField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  TIME_DATE_FORMAT,
  languageOptions,
  STATUS_ACTIVE,
  statusOptions,
  customerBusinessErrorMaps
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { businessSchema } from '@/schemaValidations';
import { BusinessBodyType, BusinessResType, CustomerResType } from '@/types';
import {
  convertLocalToUTC,
  convertUTCToLocal,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function BusinessForm({ queryKey }: { queryKey: string }) {
  const [logoPath, setLogoPath] = useState<string>('');
  const [bannerPath, setBannerPath] = useState<string>('');
  const uploadLogoMutation = useUploadLogoMutation();
  const { id } = useParams<{
    id: string;
  }>();

  const { data, loading, queryString, handleSubmit, renderActions } =
    useSaveBase<BusinessResType, BusinessBodyType>({
      apiConfig: apiConfig.business,
      options: {
        queryKey,
        objectName: 'khách hàng',
        listPageUrl: route.business.getList.path,
        pathParams: {
          id
        },
        mode: id === 'create' ? 'create' : 'edit'
      }
    });

  const defaultValues: BusinessBodyType = {
    address: '',
    bannerPath: '',
    city: '',
    customerId: '',
    expireDate: '',
    extDate: '',
    hotline: '',
    lang: '',
    logoPath: '',
    name: '',
    note: '',
    settings: '',
    taxNumber: '',
    tenantId: '',
    zipCode: '',
    status: STATUS_ACTIVE
  };

  const initialValues: BusinessBodyType = useMemo(() => {
    return {
      customerId: data?.customer?.id?.toString() ?? '',
      address: data?.address ?? '',
      bannerPath: data?.bannerPath ?? '',
      city: data?.city ?? '',
      expireDate: convertUTCToLocal(data?.expireDate ?? '') ?? new Date(),
      extDate: convertUTCToLocal(data?.extDate ?? '') ?? new Date(),
      hotline: data?.hotline ?? '',
      lang: data?.lang ?? '',
      logoPath: data?.logoPath ?? '',
      name: data?.name ?? '',
      note: data?.note ?? '',
      settings: data?.settings ?? '',
      taxNumber: data?.taxNumber ?? '',
      tenantId: data?.businessTenantId ?? '',
      zipCode: data?.zipCode ?? '',
      status: data?.status ?? STATUS_ACTIVE
    };
  }, [data]);

  useEffect(() => {
    if (data?.bannerPath) setBannerPath(data?.bannerPath);
  }, [data?.bannerPath]);

  useEffect(() => {
    if (data?.logoPath) setLogoPath(data?.logoPath);
  }, [data?.logoPath]);

  const onSubmit = async (
    values: BusinessBodyType,
    form: UseFormReturn<BusinessBodyType>
  ) => {
    await handleSubmit(
      {
        ...values,
        expireDate: convertLocalToUTC(values.expireDate),
        extDate: convertLocalToUTC(values.extDate),
        logoPath,
        bannerPath
      },
      form,
      customerBusinessErrorMaps
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Doanh nghiệp',
          href: renderListPageUrl(route.business.getList.path, queryString)
        },
        { label: `${!data ? 'Thêm mới' : 'Cập nhật'} doanh nghiệp` }
      ]}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={businessSchema}
        initialValues={initialValues}
        className='w-200'
      >
        {(form) => (
          <>
            <Row>
              <Col>
                <UploadImageField
                  value={renderImageUrl(logoPath)}
                  loading={uploadLogoMutation.isPending}
                  control={form.control}
                  name='logoPath'
                  onChange={(url) => {
                    setLogoPath(url);
                  }}
                  size={100}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadLogoMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  required
                  label='Logo'
                />
              </Col>
              <Col>
                <UploadImageField
                  value={renderImageUrl(bannerPath)}
                  loading={uploadLogoMutation.isPending}
                  control={form.control}
                  name='bannerPath'
                  onChange={(url) => {
                    setBannerPath(url);
                  }}
                  size={100}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadLogoMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  label='Banner'
                  required
                  aspect={16 / 9}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên doanh nghiệp'
                  placeholder='Tên doanh nghiệp'
                  required
                />
              </Col>
              <Col>
                <InputField
                  control={form.control}
                  name='hotline'
                  label='Đường dây nóng'
                  placeholder='Đường dây nóng'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='zipCode'
                  label='Mã bưu điện'
                  placeholder='Mã bưu điện'
                  required
                />
              </Col>
              <Col>
                <AutoCompleteField
                  control={form.control}
                  name='customerId'
                  apiConfig={apiConfig.customer.getList}
                  mappingData={(item: CustomerResType) => ({
                    label: item.account.fullName,
                    value: item.id.toString()
                  })}
                  searchParams={['fullName']}
                  label='Khách hàng'
                  placeholder='Khách hàng'
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <DateTimePickerField
                  control={form.control}
                  name='expireDate'
                  label='Ngày hết hạn'
                  required
                  format={TIME_DATE_FORMAT}
                />
              </Col>
              <Col>
                <DateTimePickerField
                  control={form.control}
                  name='extDate'
                  label='Ngày gia hạn'
                  required
                  format={TIME_DATE_FORMAT}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <SelectField
                  control={form.control}
                  name='lang'
                  label='Ngôn ngữ'
                  options={languageOptions}
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  placeholder='Ngôn ngữ'
                  required
                />
              </Col>
              <Col>
                <SelectField
                  control={form.control}
                  name='status'
                  label='Trạng thái'
                  options={statusOptions}
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  placeholder='Trạng thái'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='taxNumber'
                  label='Mã số thuế'
                  placeholder='Mã số thuế'
                  required
                />
              </Col>
              <Col>
                <InputField
                  control={form.control}
                  name='tenantId'
                  label='Mã thuê bao'
                  placeholder='Mã thuê bao'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='city'
                  label='Thành phố'
                  placeholder='Thành phố'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TextAreaField
                  control={form.control}
                  name='address'
                  label='Địa chỉ'
                  placeholder='Địa chỉ'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TextAreaField
                  control={form.control}
                  name='note'
                  label='Ghi chú'
                  placeholder='Ghi chú'
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
