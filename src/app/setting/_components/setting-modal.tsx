'use client';

import {
  Button,
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
import { settingSchema } from '@/schema-validations';
import type { SettingBodyType, SettingResType } from '@/types';
import {
  parseBooleanValue,
  parseSelectOptions,
  stringifyBooleanValue
} from '@/utils';
import { Input } from '@/components/ui/input';
import { useMemo, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

type SettingModalProps = {
  open: boolean;
  setting?: SettingResType | null;
  groupName: string;
  onClose: () => void;
};

type SettingFormType = Omit<SettingBodyType, 'options' | 'valueData'> & {
  options: string;
  valueData: boolean | number | string;
};

export function SettingModal({
  open,
  setting,
  groupName,
  onClose
}: SettingModalProps) {
  const { mutateAsync: uploadFileMutate } = useUploadFileMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const listContainerRef = useRef<HTMLDivElement>(null);

  const scrollListToNewItem = () => {
    requestAnimationFrame(() => {
      const container = listContainerRef.current;
      if (!container) return;
      container.scrollTop = container.scrollHeight;
      const inputs = container.querySelectorAll('input');
      inputs[inputs.length - 1]?.focus();
    });
  };

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

  const defaultValues: SettingFormType = useMemo(
    () => ({
      valueData: '',
      dataType: '',
      description: '',
      groupName,
      isSystem: false,
      keyName: '',
      options: ''
    }),
    [groupName]
  );

  const initialValues: SettingFormType = useMemo(
    () => ({
      valueData:
        setting?.dataType === 'Boolean'
          ? parseBooleanValue(setting?.valueData)
          : setting?.dataType === 'List'
            ? String(setting?.valueData ?? '')
            : (setting?.valueData ?? defaultValues.valueData),
      dataType: setting?.dataType ?? defaultValues.dataType,
      description: setting?.description ?? defaultValues.description,
      groupName: defaultValues.groupName,
      isSystem: setting?.isSystem ?? defaultValues.isSystem,
      keyName: setting?.keyName ?? defaultValues.keyName,
      options:
        setting?.dataType === 'Select'
          ? parseSelectOptions(setting?.options)
              .map((option) => option.value)
              .join(',')
          : (setting?.options ?? defaultValues.options)
    }),
    [
      defaultValues.dataType,
      defaultValues.description,
      defaultValues.groupName,
      defaultValues.isSystem,
      defaultValues.keyName,
      defaultValues.options,
      defaultValues.valueData,
      setting?.dataType,
      setting?.description,
      setting?.isSystem,
      setting?.keyName,
      setting?.options,
      setting?.valueData
    ]
  );

  const onSubmit = async (
    values: SettingFormType,
    form: UseFormReturn<SettingFormType>
  ) => {
    const submitValues: SettingBodyType = {
      ...values,
      options:
        values.dataType === 'Select'
          ? JSON.stringify(parseSelectOptions(values.options))
          : values.options,
      valueData:
        values.dataType === 'Upload'
          ? imageManager.currentUrl
          : values.dataType === 'Boolean'
            ? stringifyBooleanValue(values.valueData)
            : values.dataType === 'List'
              ? String(values.valueData || '')
                  .split(';')
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .join(';')
              : String(values.valueData)
    };

    await imageManager.handleSubmit();
    await handleSubmit(
      submitValues,
      form as unknown as UseFormReturn<SettingBodyType>,
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
      className='top-1/2 left-1/2 mx-0 w-200 -translate-x-1/2 -translate-y-1/2'
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
                      formItemClassName='items-end h-full mb-3'
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

                case 'List': {
                  const rawValue = (form.watch('valueData') as string) ?? '';
                  const items = rawValue ? rawValue.split(';') : [];

                  const setItems = (newItems: string[]) => {
                    form.setValue('valueData', newItems.join(';'), {
                      shouldDirty: true
                    });
                  };

                  return (
                    <div className='w-full space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Từ khóa</span>
                        <Button
                          type='button'
                          variant='primary'
                          size='sm'
                          onClick={() => {
                            setItems([...items, '']);
                            scrollListToNewItem();
                          }}
                        >
                          <Plus className='size-4' />
                          Thêm
                        </Button>
                      </div>
                      {items.length === 0 ? (
                        <p className='text-muted-foreground text-sm'>
                          Chưa có từ nào
                        </p>
                      ) : (
                        <div
                          ref={listContainerRef}
                          className='grid max-h-50 grid-cols-2 gap-3 overflow-y-auto px-1 py-2'
                        >
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              <Input
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[index] = e.target.value;
                                  setItems(newItems);
                                }}
                                placeholder='Từ khóa'
                                className='focus-visible:ring-sporty-blue text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                onClick={() =>
                                  setItems(items.filter((_, i) => i !== index))
                                }
                                className='text-destructive hover:text-destructive shrink-0'
                              >
                                <Trash2 className='size-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

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
                    />
                  </Col>
                  {dataType !== 'RichText' &&
                    dataType !== 'Upload' &&
                    dataType !== 'List' && (
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

                {(dataType === 'RichText' ||
                  dataType === 'Upload' ||
                  dataType === 'List') && (
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

                <>
                  {renderActions(
                    form as unknown as UseFormReturn<SettingBodyType>,
                    {
                      onCancel: handleCancel
                    }
                  )}
                </>
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
