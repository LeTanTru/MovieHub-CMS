'use client';

import {
  BooleanField,
  Button,
  Col,
  InputField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  languageOptions,
  objectNames,
  queryKeys,
  videoLibrarySubtitleErrorMaps
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { useVideoSubtitleTranslateMutation } from '@/queries';
import {
  videoLibrarySubtitleSchema,
  videoLibrarySubtitleTranslateSchema
} from '@/schemaValidations';
import type {
  VideoLibrarySubtitleBodyType,
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleTranslateBodyType
} from '@/types';
import { applyFormErrors, invalidateQueries, notify } from '@/utils';
import { isAxiosError } from 'axios';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type VideoLibrarySubtitleModalProps = {
  open: boolean;
  subtitle: VideoLibrarySubtitleResType | null; // Null means Translate (Create) mode
  defaultSubtitleId?: string; // Used in Translate mode
  onClose: () => void;
};

export function VideoLibrarySubtitleModal({
  open,
  subtitle,
  defaultSubtitleId = '',
  onClose
}: VideoLibrarySubtitleModalProps) {
  const isEdit = !!subtitle;

  // ----------------------------------------------------
  // Translate Form State & Mutation
  // ----------------------------------------------------
  const translateMutation = useVideoSubtitleTranslateMutation();
  const [isTranslateFormChanged, setIsTranslateFormChanged] =
    useState<boolean>(false);

  const translateDefaultValues: VideoLibrarySubtitleTranslateBodyType = {
    id: defaultSubtitleId,
    label: '',
    language: ''
  };

  const translateInitialValues: VideoLibrarySubtitleTranslateBodyType = useMemo(
    () => ({
      id: defaultSubtitleId,
      label: '',
      language: ''
    }),
    [defaultSubtitleId]
  );

  const handleTranslateSubmit = async (
    values: VideoLibrarySubtitleTranslateBodyType,
    form: UseFormReturn<VideoLibrarySubtitleTranslateBodyType>
  ) => {
    try {
      const res = await translateMutation.mutateAsync(values);
      if (res.result) {
        setIsTranslateFormChanged(false);
        notify.success('Gửi yêu cầu dịch phụ đề thành công');
        invalidateQueries([queryKeys.VIDEO_LIBRARY_SUBTITLE_LIST]);
        onClose();
      } else {
        const code = res.code;
        if (code) {
          applyFormErrors(form, code, videoLibrarySubtitleErrorMaps);
        } else {
          notify.error('Gửi yêu cầu dịch phụ đề thất bại');
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const errCode = error?.response?.data?.code;
        if (errCode) {
          applyFormErrors(form, errCode, videoLibrarySubtitleErrorMaps);
          return;
        }
      }
      notify.error('Gửi yêu cầu dịch phụ đề thất bại');
    }
  };

  // ----------------------------------------------------
  // Edit Form useSaveBase Hook
  // ----------------------------------------------------
  const {
    loading: editLoading,
    isFormChanged: isEditFormChanged,
    onFormChange: onEditFormChange,
    handleSubmit: handleEditSubmit,
    renderActions
  } = useSaveBase<VideoLibrarySubtitleResType, VideoLibrarySubtitleBodyType>({
    apiConfig: apiConfig.videoLibrarySubtitle,
    options: {
      queryKey: queryKeys.VIDEO_LIBRARY_SUBTITLE,
      objectName: objectNames.SUBTITLE,
      pathParams: {
        id: subtitle?.id ?? ''
      },
      mode: 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        onClose();
      };
    }
  });

  const editDefaultValues: VideoLibrarySubtitleBodyType = {
    id: '',
    label: '',
    isDefault: false
  };

  const editInitialValues: VideoLibrarySubtitleBodyType = useMemo(
    () => ({
      id: subtitle?.id ?? '',
      label: subtitle?.label ?? '',
      isDefault: subtitle?.isDefault ?? false
    }),
    [subtitle]
  );

  const handleEditSubmitWrapper = async (
    values: VideoLibrarySubtitleBodyType,
    form: UseFormReturn<VideoLibrarySubtitleBodyType>
  ) => {
    await handleEditSubmit(
      {
        ...values,
        id: subtitle?.id ?? ''
      },
      form
    );
    invalidateQueries([queryKeys.VIDEO_LIBRARY_SUBTITLE_LIST]);
  };

  // ----------------------------------------------------
  // Unified Cancel & Close Handles
  // ----------------------------------------------------
  const handleCancel = () => {
    onClose();
    if (isEdit) {
      onEditFormChange(false);
    } else {
      setIsTranslateFormChanged(false);
    }
  };

  const isFormChanged = isEdit ? isEditFormChanged : isTranslateFormChanged;

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='subtitle-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>{isEdit ? 'Cập nhật phụ đề' : 'Dịch phụ đề'}</Modal.Header>
      <Modal.Body>
        {isEdit ? (
          <BaseForm
            onSubmit={handleEditSubmitWrapper}
            defaultValues={editDefaultValues}
            schema={videoLibrarySubtitleSchema}
            initialValues={editInitialValues}
            onFormChange={onEditFormChange}
          >
            {(form) => (
              <>
                <Row>
                  <Col className='grid-c-12'>
                    <InputField
                      control={form.control}
                      name='label'
                      label='Ngôn ngữ phụ đề'
                      placeholder='Ngôn ngữ phụ đề'
                      required
                    />
                  </Col>
                </Row>

                <Row className='mb-0'>
                  <Col className='grid-c-12'>
                    <BooleanField
                      control={form.control}
                      name='isDefault'
                      label='Mặc định'
                      disabled={subtitle?.isDefault}
                    />
                  </Col>
                </Row>

                <div className='mt-4'>
                  {renderActions(form, {
                    onCancel: handleCancel
                  })}
                </div>
                {editLoading && (
                  <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                    <CircleLoading className='stroke-sporty-blue mt-10' />
                  </div>
                )}
              </>
            )}
          </BaseForm>
        ) : (
          <BaseForm
            onSubmit={handleTranslateSubmit}
            defaultValues={translateDefaultValues}
            schema={videoLibrarySubtitleTranslateSchema}
            initialValues={translateInitialValues}
            onFormChange={setIsTranslateFormChanged}
          >
            {(form) => (
              <>
                <Row>
                  <Col className='grid-c-12'>
                    <SelectField
                      control={form.control}
                      name='language'
                      label='Ngôn ngữ phụ đề cần dịch'
                      placeholder='Chọn ngôn ngữ phụ đề cần dịch'
                      options={languageOptions}
                      required
                      onValueChange={(val) => {
                        if (val) {
                          const selectedOpt = languageOptions.find(
                            (opt) => opt.value === val
                          );
                          if (selectedOpt) {
                            form.setValue('label', selectedOpt.label, {
                              shouldDirty: true,
                              shouldValidate: true
                            });
                          }
                        }
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col className='grid-c-12'>
                    <InputField
                      control={form.control}
                      name='label'
                      label='Tên hiển thị phụ đề'
                      placeholder='Nhập tên hiển thị phụ đề'
                      required
                    />
                  </Col>
                </Row>

                <div className='mt-4'>
                  <Row className='mb-0 justify-end'>
                    <Col className='w-40'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleCancel}
                        className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
                      >
                        <ArrowLeftFromLine />
                        Hủy
                      </Button>
                    </Col>
                    <Col className='w-40'>
                      <Button
                        disabled={
                          !form.formState.isDirty || translateMutation.isPending
                        }
                        type='submit'
                        variant='primary'
                        loading={translateMutation.isPending}
                      >
                        <Save />
                        Dịch
                      </Button>
                    </Col>
                  </Row>
                </div>
                {translateMutation.isPending && (
                  <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                    <CircleLoading className='stroke-sporty-blue mt-10' />
                  </div>
                )}
              </>
            )}
          </BaseForm>
        )}
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
