'use client';

import { ArrowLeftFromLine, Crosshair, Save } from 'lucide-react';
import { BaseForm } from '@/components/form/base-form';
import {
  Button,
  Col,
  Row,
  TextAreaField,
  TimeMaskField,
  ToolTip
} from '@/components/form';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/modal';
import { secondsToVttTime, timeToSeconds } from '@/utils';
import type { SubtitleBodyType, SubtitleType } from '@/types';
import { subtitleSchema } from '@/schema-validations';
import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoLibrarySubtitleStore } from '@/store';
import type { UseFormReturn } from 'react-hook-form';
import { SUBTITLE_TIME_PLACEHOLDER } from '@/constants';

function validateSubtitleTimeFields({
  form,
  field,
  start,
  end,
  duration
}: {
  form: UseFormReturn<SubtitleBodyType>;
  field: 'start' | 'end';
  start: string;
  end: string;
  duration: number;
}) {
  const startTime = timeToSeconds(start || SUBTITLE_TIME_PLACEHOLDER);
  const endTime = timeToSeconds(end || SUBTITLE_TIME_PLACEHOLDER);
  const hasValidOrder = startTime < endTime;
  const hasDuration = duration > 0 && Number.isFinite(duration);

  if (hasValidOrder) {
    form.clearErrors(field === 'start' ? 'end' : 'start');
  }

  if (field === 'start') {
    if (hasDuration && startTime >= duration) {
      form.setError('start', {
        message: 'Thời gian bắt đầu phải nhỏ hơn thời lượng video'
      });
    } else if (hasValidOrder) {
      form.clearErrors('start');
    }
  }

  if (field === 'end') {
    if (hasDuration && endTime > duration) {
      form.setError('end', {
        message: 'Thời gian kết thúc phải nhỏ hơn thời lượng video'
      });
    } else if (hasValidOrder) {
      form.clearErrors('end');
    }
  }
}

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

    if (startTime >= item.startTime && startTime < item.endTime) {
      fields.start = true;
    }

    if (endTime > item.startTime && endTime <= item.endTime) {
      fields.end = true;
    }

    if (fields.start && fields.end) break;
  }

  return fields;
}

const defaultValues: SubtitleBodyType = {
  start: '',
  end: '',
  text: ''
};

export function SubtitleForm() {
  const {
    currentTime,
    duration,
    subtitles,
    subtitleFormState,
    isSubtitleFormChanged,
    addSubtitle,
    updateSubtitle,
    closeSubtitleForm,
    setSubtitleFormChanged,
    setSelectedSubtitleId
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      duration: s.duration,
      subtitles: s.subtitles,
      subtitleFormState: s.subtitleFormState,
      isSubtitleFormChanged: s.isSubtitleFormChanged,
      addSubtitle: s.addSubtitle,
      updateSubtitle: s.updateSubtitle,
      closeSubtitleForm: s.closeSubtitleForm,
      setSubtitleFormChanged: s.setSubtitleFormChanged,
      setSelectedSubtitleId: s.setSelectedSubtitleId
    }))
  );
  const formRef = useRef<HTMLFormElement | null>(null);

  const subtitle =
    subtitleFormState?.mode === 'edit'
      ? subtitles.find((item) => item.id === subtitleFormState.subtitleId)
      : null;

  const disabled = subtitleFormState?.mode !== 'create' && !subtitle;

  const initialValues: SubtitleBodyType = useMemo(() => {
    if (disabled) {
      return defaultValues;
    }

    return {
      start: subtitle?.start ?? SUBTITLE_TIME_PLACEHOLDER,
      end: subtitle?.end ?? SUBTITLE_TIME_PLACEHOLDER,
      text: subtitle?.text ?? defaultValues.text
    };
  }, [subtitle, disabled]);

  useEffect(() => {
    if (!disabled) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [subtitle?.id, disabled]);

  const applyCurrentTime = (
    field: 'start' | 'end',
    form: UseFormReturn<SubtitleBodyType>
  ) => {
    const selectedSeconds =
      duration > 0 && Number.isFinite(duration)
        ? Math.min(Math.max(currentTime, 0), duration)
        : Math.max(currentTime, 0);

    form.setValue(field, secondsToVttTime(selectedSeconds), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });

    const values = form.getValues();
    validateSubtitleTimeFields({
      form,
      field,
      start: values.start,
      end: values.end,
      duration
    });
  };

  const handleClose = () => {
    setSubtitleFormChanged(false);
    closeSubtitleForm();
    setSelectedSubtitleId(null);
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
        message: 'Thời gian kết thúc phải nhỏ hơn thời lượng video'
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
      if (overlappedFields.start) {
        form.setError('start', {
          message: 'Thời gian bắt đầu chồng lấn phân đoạn khác'
        });
      }

      if (overlappedFields.end) {
        form.setError('end', {
          message: 'Thời gian kết thúc chồng lấn phân đoạn khác'
        });
      }

      hasError = true;
    }

    if (hasError) return;

    const normalizedValues = {
      start: secondsToVttTime(startTime),
      end: secondsToVttTime(endTime),
      text: values.text
    };

    if (subtitle) {
      updateSubtitle(subtitle.id, {
        ...subtitle,
        ...normalizedValues,
        startTime,
        endTime
      });
    } else {
      addSubtitle(normalizedValues);
    }

    handleClose();
  };

  return (
    <BaseForm
      ref={formRef}
      schema={subtitleSchema}
      defaultValues={defaultValues}
      initialValues={initialValues}
      className={cn(
        'my-2 ml-2 rounded-md shadow-sm transition-all duration-200',
        {
          'pointer-events-none bg-gray-50/50 opacity-60 select-none': disabled
        }
      )}
      onSubmit={onSubmit}
      onFormChange={setSubtitleFormChanged}
    >
      {(form) => {
        return (
          <>
            <div className='mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-2'>
              <h2
                className={cn('font-semibold uppercase', {
                  'text-transparent': disabled
                })}
              >
                {subtitle ? 'Cập nhật' : 'Thêm'} phụ đề
              </h2>
            </div>
            <Row>
              <Col className='grid-c-6'>
                <div className='flex items-end gap-2'>
                  <TimeMaskField
                    control={form.control}
                    name='start'
                    label='Thời gian bắt đầu'
                    placeholder={SUBTITLE_TIME_PLACEHOLDER}
                    required
                    disabled={disabled}
                    tabIndex={-1}
                    formItemClassName='grow'
                  />
                  <ToolTip title='Áp dụng thời gian hiện tại' side='bottom'>
                    <Button
                      className='rounded-md'
                      size='icon'
                      type='button'
                      variant='ghost'
                      disabled={disabled}
                      aria-label='Apply current video time to start'
                      onClick={() => applyCurrentTime('start', form)}
                    >
                      <Crosshair />
                    </Button>
                  </ToolTip>
                </div>
              </Col>
              <Col className='grid-c-6'>
                <div className='flex items-end gap-2'>
                  <TimeMaskField
                    control={form.control}
                    name='end'
                    label='Thời gian kết thúc'
                    placeholder={SUBTITLE_TIME_PLACEHOLDER}
                    required
                    disabled={disabled}
                    tabIndex={-1}
                    formItemClassName='grow'
                  />
                  <ToolTip title='Áp dụng thời gian hiện tại' side='bottom'>
                    <Button
                      className='rounded-md'
                      size='icon'
                      type='button'
                      variant='ghost'
                      disabled={disabled}
                      aria-label='Apply current video time to end'
                      onClick={() => applyCurrentTime('end', form)}
                    >
                      <Crosshair />
                    </Button>
                  </ToolTip>
                </div>
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
                  disabled={disabled}
                />
              </Col>
            </Row>
            <Row className='mb-0 justify-end'>
              <Col className='w-40'>
                {isSubtitleFormChanged ? (
                  <ConfirmModal
                    message='Bạn có chắc chắn muốn hủy không ?'
                    onConfirm={handleClose}
                    trigger={
                      <Button
                        type='button'
                        variant='outline'
                        disabled={disabled}
                        className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50 disabled:border-rose-500/50 disabled:text-rose-500/50 disabled:hover:border-rose-500/50 disabled:hover:text-rose-500/50'
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
                    disabled={disabled}
                    onClick={handleClose}
                    className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50 disabled:border-rose-500/50 disabled:text-rose-500/50 disabled:hover:border-rose-500/50 disabled:hover:text-rose-500/50'
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
                  disabled={disabled || !isSubtitleFormChanged}
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
  );
}
