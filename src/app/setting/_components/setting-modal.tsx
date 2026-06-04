'use client';

import {
  CheckboxField,
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
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  objectNames,
  queryKeys,
  settingDataTypes,
  settingErrorMaps
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadFileMutation } from '@/queries';
import { settingSchema } from '@/schemaValidations';
import type { SettingBodyType, SettingResType } from '@/types';
import { parseSelectOptions } from '@/utils';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

type SettingModalProps = {
  open: boolean;
  setting?: SettingResType | null;
  groupName: string;
  onClose: () => void;
};

export function SettingModal({
  open,
  setting,
  groupName,
  onClose
}: SettingModalProps) {
  const { mutateAsync: uploadFileMutate } = useUploadFileMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const {
    loading,
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<SettingResType, SettingBodyType>({
    apiConfig: apiConfig.setting,
    options: {
      queryKey: queryKeys.SETTING,
      objectName: objectNames.SETTING,
      pathParams: {
        id: setting?.id ?? ''
      },
      mode: !setting ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        onClose();
      };
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: setting?.valueData,
    deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const defaultValues: SettingBodyType = {
    valueData: '',
    dataType: '',
    description: '',
    groupName,
    isSystem: false,
    keyName: '',
    options: ''
  };

  const initialValues: SettingBodyType = useMemo(
    () => ({
      valueData: setting?.valueData ?? '',
      dataType: setting?.dataType ?? '',
      description: setting?.description ?? '',
      groupName,
      isSystem: setting?.isSystem ?? false,
      keyName: setting?.keyName ?? '',
      options:
        setting?.dataType === 'Select'
          ? parseSelectOptions(setting?.options)
              .map((option) => option.value)
              .join(',')
          : (setting?.options ?? '')
    }),
    [
      groupName,
      setting?.dataType,
      setting?.description,
      setting?.isSystem,
      setting?.keyName,
      setting?.options,
      setting?.valueData
    ]
  );

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

  const handleCancel = async () => {
    onClose();
    onFormChange(false);
    await imageManager.handleCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='setting-modal-title'
      confirmOnClose={isFormChanged}
      className='w-200 max-[1537px]:top-10'
    >
      <Modal.Header>
        {`${isEditing ? 'Cập nhật' : 'Thêm'} cài đặt`}
      </Modal.Header>
      <Modal.Body scrollable>
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
                    <CheckboxField
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
                      disabled
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
                    <CheckboxField
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
                    <CircleLoading className='stroke-sporty-blue mt-20' />
                  </div>
                )}
              </>
            );
          }}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
