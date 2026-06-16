'use client';

import { BooleanField, Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { apiConfig, objectNames, queryKeys } from '@/constants';
import { useSaveBase } from '@/hooks';
import { videoLibrarySubtitleSchema } from '@/schemaValidations';
import type {
  VideoLibrarySubtitleBodyType,
  VideoLibrarySubtitleResType
} from '@/types';
import { invalidateQueries } from '@/utils';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const defaultValues: VideoLibrarySubtitleBodyType = {
  id: '',
  label: '',
  isDefault: false
};

type VideoLibrarySubtitleModalProps = {
  open: boolean;
  subtitle: VideoLibrarySubtitleResType | null;
  onClose: () => void;
};

export function VideoLibrarySubtitleModal({
  open,
  subtitle,
  onClose
}: VideoLibrarySubtitleModalProps) {
  const { loading, isFormChanged, onFormChange, handleSubmit, renderActions } =
    useSaveBase<VideoLibrarySubtitleResType, VideoLibrarySubtitleBodyType>({
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

  const initialValues: VideoLibrarySubtitleBodyType = useMemo(
    () => ({
      id: subtitle?.id ?? defaultValues.id,
      label: subtitle?.label ?? defaultValues.label,
      isDefault: subtitle?.isDefault ?? defaultValues.isDefault
    }),
    [subtitle?.id, subtitle?.isDefault, subtitle?.label]
  );

  const onSubmit = async (
    values: VideoLibrarySubtitleBodyType,
    form: UseFormReturn<VideoLibrarySubtitleBodyType>
  ) => {
    await handleSubmit(
      {
        ...values,
        id: subtitle?.id ?? ''
      },
      form
    );
    invalidateQueries([queryKeys.VIDEO_LIBRARY_SUBTITLE_LIST]);
  };

  const handleCancel = () => {
    onClose();
    onFormChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='subtitle-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>Cập nhật phụ đề</Modal.Header>
      <Modal.Body>
        <BaseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          schema={videoLibrarySubtitleSchema}
          initialValues={initialValues}
          onFormChange={onFormChange}
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
              {loading && (
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
