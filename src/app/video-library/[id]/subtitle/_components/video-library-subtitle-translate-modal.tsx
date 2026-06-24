'use client';

import { Button, Col, InputField, Row, SelectField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  languageOptions,
  queryKeys,
  videoLibrarySubtitleErrorMaps
} from '@/constants';
import { useVideoSubtitleTranslateMutation } from '@/queries';
import { videoLibrarySubtitleTranslateSchema } from '@/schema-validations';
import type { VideoLibrarySubtitleTranslateBodyType } from '@/types';
import { applyFormErrors, invalidateQueries, notify } from '@/utils';
import { isAxiosError } from 'axios';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type VideoLibrarySubtitleTranslateModalProps = {
  open: boolean;
  defaultSubtitleId?: string;
  translatedLanguages: string[];
  onClose: () => void;
};

export function VideoLibrarySubtitleTranslateModal({
  open,
  defaultSubtitleId = '',
  translatedLanguages,
  onClose
}: VideoLibrarySubtitleTranslateModalProps) {
  const { mutateAsync: translateAsync, isPending } =
    useVideoSubtitleTranslateMutation();
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const defaultValues: VideoLibrarySubtitleTranslateBodyType = useMemo(
    () => ({
      id: defaultSubtitleId,
      label: '',
      language: ''
    }),
    [defaultSubtitleId]
  );

  const initialValues: VideoLibrarySubtitleTranslateBodyType = useMemo(
    () => ({
      id: defaultValues.id,
      label: defaultValues.label,
      language: defaultValues.language
    }),
    [defaultValues.id, defaultValues.label, defaultValues.language]
  );

  const filteredLanguageOptions = languageOptions.filter(
    (opt) => !translatedLanguages.includes(opt.value)
  );

  const onSubmit = async (
    values: VideoLibrarySubtitleTranslateBodyType,
    form: UseFormReturn<VideoLibrarySubtitleTranslateBodyType>
  ) => {
    try {
      const res = await translateAsync(values);
      if (res.result) {
        setIsFormChanged(false);
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

  const handleCancel = () => {
    onClose();
    setIsFormChanged(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='subtitle-translate-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>Dịch phụ đề</Modal.Header>
      <Modal.Body>
        <BaseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          schema={videoLibrarySubtitleTranslateSchema}
          initialValues={initialValues}
          onFormChange={setIsFormChanged}
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
                    options={filteredLanguageOptions}
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
                      className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50 disabled:border-rose-500/50 disabled:text-rose-500/50 disabled:hover:border-rose-500/50 disabled:hover:text-rose-500/50'
                    >
                      <ArrowLeftFromLine />
                      Hủy
                    </Button>
                  </Col>
                  <Col className='w-40'>
                    <Button
                      disabled={!form.formState.isDirty || isPending}
                      type='submit'
                      variant='primary'
                      loading={isPending}
                    >
                      <Save />
                      Dịch
                    </Button>
                  </Col>
                </Row>
              </div>
              {isPending && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-sporty-blue mt-10' />
                </div>
              )}
            </>
          )}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
