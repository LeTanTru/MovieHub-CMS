'use client';

import {
  BooleanField,
  Col,
  InputField,
  NumberField,
  RichTextField,
  Row,
  SelectField,
  TextAreaField,
  UploadFileField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  ErrorCode,
  queryKeys,
  settingDataTypes,
  settingErrorMaps
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadFileMutation } from '@/queries';
import { route } from '@/routes';
import { settingSchema } from '@/schemaValidations';
import type { SettingBodyType, SettingResType } from '@/types';
import { parseSelectOptions, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function SettingForm() {
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
  } = useSaveBase<SettingResType, SettingBodyType>({
    apiConfig: apiConfig.setting,
    options: {
      queryKey: queryKeys.SETTING,
      objectName: 'cài đặt',
      listPageUrl: route.setting.getList.path,
      pathParams: { id },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.valueData,
    deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const defaultValues: SettingBodyType = {
    valueData: '',
    dataType: '',
    description: '',
    groupName: '',
    isSystem: false,
    keyName: '',
    options: ''
  };

  const initialValues: SettingBodyType = useMemo(
    () => ({
      valueData: data?.valueData ?? '',
      dataType: data?.dataType ?? '',
      description: data?.description ?? '',
      groupName: data?.groupName ?? '',
      isSystem: data?.isSystem ?? false,
      keyName: data?.keyName ?? '',
      options:
        data?.dataType === 'Select'
          ? parseSelectOptions(data?.options)
              .map((option) => option.value)
              .join(',')
          : (data?.options ?? '')
    }),
    [
      data?.dataType,
      data?.description,
      data?.groupName,
      data?.isSystem,
      data?.keyName,
      data?.options,
      data?.valueData
    ]
  );

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (
    values: SettingBodyType,
    form: UseFormReturn<SettingBodyType>
  ) => {
    await imageManager.handleSubmit();
    await handleSubmit(
      {
        ...values,
        options:
          values.dataType === 'Select'
            ? JSON.stringify(parseSelectOptions(values.options))
            : values.options,
        valueData:
          values.dataType === 'Upload'
            ? imageManager.currentUrl
            : values.valueData
      },
      form,
      settingErrorMaps
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Cài đặt',
          href: renderListPageUrl(route.setting.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} cài đặt`
        }
      ]}
      notFound={responseCode === ErrorCode.SETTING_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy cài đặt này'
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onFormChange={onFormChange}
        onSubmit={onSubmit}
        schema={settingSchema}
      >
        {(form) => {
          const dataType = form.watch('dataType');
          const rawOptions = form.watch('options') ?? '';

          const parsedSelectOptions = parseSelectOptions(rawOptions);

          const renderValueField = () => {
            switch (dataType) {
              case 'Integer':
                return (
                  <NumberField
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    placeholder='Nhập số nguyên'
                    required
                  />
                );

              case 'Double':
                return (
                  <NumberField
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    placeholder='Nhập số thực'
                    required
                    isFloat
                  />
                );

              case 'Boolean':
                return (
                  <BooleanField
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    required
                  />
                );

              case 'RichText':
                return (
                  <RichTextField
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    placeholder='Nhập nội dung'
                    required
                  />
                );

              case 'Select':
                return (
                  <SelectField
                    options={parsedSelectOptions}
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    placeholder='Chọn giá trị'
                    required
                    disabled={parsedSelectOptions.length === 0}
                  />
                );

              case 'Upload':
                return (
                  <UploadFileField
                    control={form.control}
                    name='valueData'
                    label='Tệp'
                    accept='*/*'
                    onChange={imageManager.trackUpload}
                    uploadFileFn={async (file, onProgress) => {
                      const res = await uploadFileMutate({
                        file,
                        options: {
                          onUploadProgress: (e) => {
                            onProgress(
                              Math.round((e.loaded * 100) / (e.total ?? 1))
                            );
                          }
                        }
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={imageManager.handleDeleteOnClick}
                    required
                  />
                );

              case 'String':
              default:
                return (
                  <InputField
                    control={form.control}
                    name='valueData'
                    label='Giá trị'
                    placeholder='Nhập giá trị'
                    required
                  />
                );
            }
          };

          return (
            <>
              <Row>
                <Col className='grid-c-6'>
                  <InputField
                    control={form.control}
                    name='keyName'
                    placeholder='Tên'
                    label='Tên'
                    required
                  />
                </Col>
                <Col className='grid-c-6'>
                  <InputField
                    control={form.control}
                    name='groupName'
                    placeholder='Nhóm'
                    label='Nhóm'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-6'>
                  <SelectField
                    options={settingDataTypes}
                    control={form.control}
                    name='dataType'
                    label='Kiểu dữ liệu'
                    placeholder='Kiểu dữ liệu'
                    required
                    disabled={isEditing}
                  />
                </Col>
                {dataType !== 'RichText' && dataType !== 'Upload' && (
                  <Col className='grid-c-6'>{renderValueField()}</Col>
                )}
              </Row>

              {/* Options input — only shown for Select type */}
              {dataType === 'Select' && (
                <Row>
                  <Col className='grid-c-12'>
                    <InputField
                      control={form.control}
                      name='options'
                      label='Các tùy chọn (phân cách bằng dấu phẩy)'
                      placeholder='1,2,3'
                      required
                    />
                  </Col>
                </Row>
              )}

              {(dataType === 'RichText' || dataType === 'Upload') && (
                <Row>
                  <Col className='grid-c-12'>{renderValueField()}</Col>
                </Row>
              )}

              <Row>
                <Col className='grid-c-6'>
                  <BooleanField
                    control={form.control}
                    name='isSystem'
                    label='Đánh dấu hệ thống'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-12'>
                  <TextAreaField
                    control={form.control}
                    name='description'
                    label='Mô tả'
                    placeholder='Mô tả'
                    required
                  />
                </Col>
              </Row>

              <>{renderActions(form, { onCancel: handleCancel })}</>
              {loading && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-main-color mt-20' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
