'use client';

import {
  Button,
  Col,
  Row,
  TextAreaField,
  TimePickerField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { ConfirmModal, Modal } from '@/components/modal';
import { DEFAULT_TIME } from '@/constants';
import { subtitleSchema } from '@/schemaValidations';
import { useVideoLibrarySubtitleStore } from '@/store';
import { SubtitleBodyType, SubtitleType } from '@/types';
import { secondsToTime, timeToSeconds } from '@/utils';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

type SubtitleModalProps = {
  open: boolean;
  subtitle?: SubtitleType | null;
  onClose: () => void;
  onAdd?: (subtitle: SubtitleBodyType) => void;
  onEdit?: (id: string, patch: Partial<SubtitleType>) => void;
};

function getSubtitleOverlapFields(
  subtitles: SubtitleType[],
  currentSubtitleId: string | undefined,
  startTime: number,
  endTime: number
) {
  const fields = {
    start: false,
    end: false
  };

  for (const item of subtitles) {
    // Skip check overlap for current subtitle
    if (item.id === currentSubtitleId) continue;

    // Check overlap
    const overlaps = startTime < item.endTime && endTime > item.startTime;

    // Skip no overlap
    if (!overlaps) continue;

    // Check if new subtitle contains existing subtitle
    const containsSubtitle =
      startTime <= item.startTime && endTime >= item.endTime;

    // Check if new subtitle overlaps with existing subtitle
    if (
      containsSubtitle ||
      (startTime >= item.startTime && startTime < item.endTime)
    ) {
      fields.start = true;
    }

    // Check if new subtitle overlaps with existing subtitle
    if (
      containsSubtitle ||
      (endTime > item.startTime && endTime <= item.endTime)
    ) {
      fields.end = true;
    }

    // Break if both start and end are overlapped
    if (fields.start && fields.end) break;
  }

  return fields;
}

export default function SubtitleModal({
  open,
  subtitle,
  onClose,
  onAdd,
  onEdit
}: SubtitleModalProps) {
  const { duration, subtitles } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      duration: s.duration,
      subtitles: s.subtitles
    }))
  );
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const defaultValues: SubtitleBodyType = {
    start: '',
    end: '',
    text: ''
  };

  const initialValues: SubtitleBodyType = useMemo(
    () => ({
      start: subtitle?.start ?? '',
      end: subtitle?.end ?? '',
      text: subtitle?.text ?? ''
    }),
    [subtitle]
  );

  const handleClose = () => {
    setIsFormChanged(false);
    onClose();
  };

  const onSubmit = (
    values: SubtitleBodyType,
    form: UseFormReturn<SubtitleBodyType>
  ) => {
    const startTime = timeToSeconds(values.start);
    const endTime = timeToSeconds(values.end);
    const hasDuration = duration > 0;
    let hasError = false;

    if (hasDuration && startTime >= duration) {
      form.setError('start', {
        message: 'Thời gian bắt đầu phải nhỏ hơn thời lượng video'
      });
      hasError = true;
    }

    if (hasDuration && endTime > duration) {
      form.setError('end', {
        message: 'Thời gian kết thúc không được vượt quá thời lượng video'
      });
      hasError = true;
    }

    const overlappedFields = getSubtitleOverlapFields(
      subtitles,
      subtitle?.id,
      startTime,
      endTime
    );

    if (overlappedFields.start || overlappedFields.end) {
      const message = 'Thời gian phụ đề không được chồng lấn phân đoạn khác';

      if (overlappedFields.start) {
        form.setError('start', { message });
      }

      if (overlappedFields.end) {
        form.setError('end', { message });
      }

      hasError = true;
    }

    if (hasError) return;

    const normalizedValues = {
      start: secondsToTime(startTime),
      end: secondsToTime(endTime),
      text: values.text
    };

    if (subtitle) {
      onEdit?.(subtitle.id, {
        ...subtitle,
        ...normalizedValues,
        startTime,
        endTime
      });
    } else {
      onAdd?.(normalizedValues);
    }

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className='w-210'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>{subtitle ? 'Cập nhật' : 'Thêm'} phụ đề</Modal.Header>

      <Modal.Body>
        <BaseForm
          schema={subtitleSchema}
          defaultValues={defaultValues}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onFormChange={setIsFormChanged}
        >
          {(form) => {
            const start = form.watch('start');
            const end = form.watch('end');

            return (
              <>
                <Row>
                  <Col className='grid-c-6'>
                    <TimePickerField
                      control={form.control}
                      name='start'
                      label='Thời gian bắt đầu'
                      placeholder='Thời gian bắt đầu'
                      required
                      onChange={(value) => {
                        const startTime = timeToSeconds(
                          (value as string) || DEFAULT_TIME
                        );
                        const endTime = timeToSeconds(
                          (end as string) || DEFAULT_TIME
                        );
                        if (startTime < endTime) {
                          form.clearErrors('end');
                        }
                        if (startTime >= duration) {
                          form.setError('start', {
                            message:
                              'Thời gian bắt đầu phải nhỏ hơn thời lượng video'
                          });
                        } else {
                          form.clearErrors('start');
                        }
                      }}
                    />
                  </Col>
                  <Col className='grid-c-6'>
                    <TimePickerField
                      control={form.control}
                      name='end'
                      label='Thời gian kết thúc'
                      placeholder='Thời gian kết thúc'
                      required
                      onChange={(value) => {
                        const startTime = timeToSeconds(
                          (start as string) || DEFAULT_TIME
                        );
                        const endTime = timeToSeconds(
                          (value as string) || DEFAULT_TIME
                        );
                        if (startTime < endTime) {
                          form.clearErrors('start');
                        }
                        if (endTime > duration) {
                          form.setError('end', {
                            message:
                              'Thời gian kết thúc không được vượt quá thời lượng video'
                          });
                        } else {
                          form.clearErrors('end');
                        }
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='grid-c-12'>
                    <TextAreaField
                      control={form.control}
                      name='text'
                      label='Nội dung phụ đề'
                      required
                      placeholder='Nhập nội dung phụ đề'
                    />
                  </Col>
                </Row>
                <Row className='mb-0 justify-end'>
                  <Col className='w-40'>
                    {isFormChanged ? (
                      <ConfirmModal
                        message='Bạn có chắc chắn muốn hủy không ?'
                        onConfirm={handleClose}
                        trigger={
                          <Button
                            type='button'
                            variant='outline'
                            className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
                          >
                            <ArrowLeftFromLine />
                            Hủy
                          </Button>
                        }
                      />
                    ) : (
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleClose}
                        className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
                      >
                        <ArrowLeftFromLine />
                        Hủy
                      </Button>
                    )}
                  </Col>
                  <Col className='w-40'>
                    <Button
                      type='submit'
                      variant='primary'
                      disabled={!isFormChanged}
                    >
                      <Save />
                      {subtitle ? 'Cập nhật' : 'Thêm'}
                    </Button>
                  </Col>
                </Row>
              </>
            );
          }}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
