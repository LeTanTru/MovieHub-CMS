'use client';

import { ArrowLeftFromLine, Crosshair, Save } from 'lucide-react';
import { BaseForm } from '@/components/form/base-form';
import {
  Button,
  Col,
  InputField,
  Row,
  TextAreaField,
  ToolTip
} from '@/components/form';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/modal';
import { secondsToVttTime, timeToSeconds } from '@/utils';
import type {
  SubtitleBodyType,
  SubtitleTimeField,
  SubtitleType
} from '@/types';
import { subtitleSchema } from '@/schemaValidations';
import {
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useVideoLibrarySubtitleStore } from '@/store';
import type { UseFormReturn } from 'react-hook-form';
import { SUBTITLE_TIME_PLACEHOLDER } from '@/constants';

const preventTimeInputPointerSelection = (
  event: ReactPointerEvent<HTMLInputElement>
) => {
  event.preventDefault();
};

const collapseTimeInputSelection = (
  event: SyntheticEvent<HTMLInputElement>
) => {
  const input = event.currentTarget;

  if (input.selectionStart !== input.selectionEnd) {
    input.setSelectionRange(input.value.length, input.value.length);
  }
};

const START_TIME_EXCEEDS_DURATION_MESSAGE =
  'Thời gian bắt đầu phải nhỏ hơn thời lượng video';
const END_TIME_EXCEEDS_DURATION_MESSAGE =
  'Thời gian kết thúc không được vượt quá thời lượng video';

function validateSubtitleTimeFields({
  form,
  field,
  start,
  end,
  duration
}: {
  form: UseFormReturn<SubtitleBodyType>;
  field: SubtitleTimeField;
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
        message: START_TIME_EXCEEDS_DURATION_MESSAGE
      });
    } else if (hasValidOrder) {
      form.clearErrors('start');
    }
  }

  if (field === 'end') {
    if (hasDuration && endTime > duration) {
      form.setError('end', {
        message: END_TIME_EXCEEDS_DURATION_MESSAGE
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

    const overlaps = startTime < item.endTime && endTime > item.startTime;

    if (!overlaps) continue;

    const containsSubtitle =
      startTime <= item.startTime && endTime >= item.endTime;

    if (
      containsSubtitle ||
      (startTime >= item.startTime && startTime < item.endTime)
    ) {
      fields.start = true;
    }

    if (
      containsSubtitle ||
      (endTime > item.startTime && endTime <= item.endTime)
    ) {
      fields.end = true;
    }

    if (fields.start && fields.end) break;
  }

  return fields;
}

export function SubtitleForm() {
  const {
    duration,
    subtitles,
    subtitleFormState,
    isSubtitleFormChanged,
    subtitleTimePickField,
    addSubtitle,
    updateSubtitle,
    closeSubtitleForm,
    setSubtitleFormChanged,
    startSubtitleTimePick
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      duration: s.duration,
      subtitles: s.subtitles,
      subtitleFormState: s.subtitleFormState,
      isSubtitleFormChanged: s.isSubtitleFormChanged,
      subtitleTimePickField: s.subtitleTimePickField,
      addSubtitle: s.addSubtitle,
      updateSubtitle: s.updateSubtitle,
      closeSubtitleForm: s.closeSubtitleForm,
      setSubtitleFormChanged: s.setSubtitleFormChanged,
      startSubtitleTimePick: s.startSubtitleTimePick
    }))
  );
  const formRef = useRef<HTMLFormElement>(null);

  const subtitle =
    subtitleFormState?.mode === 'edit'
      ? subtitles.find((item) => item.id === subtitleFormState.subtitleId)
      : null;

  const disabled = subtitleFormState?.mode !== 'create' && !subtitle;

  const defaultValues: SubtitleBodyType = {
    start: '',
    end: '',
    text: ''
  };

  const initialValues: SubtitleBodyType = useMemo(() => {
    if (disabled) {
      return { start: '', end: '', text: '' };
    }

    return {
      start: subtitle?.start ?? SUBTITLE_TIME_PLACEHOLDER,
      end: subtitle?.end ?? SUBTITLE_TIME_PLACEHOLDER,
      text: subtitle?.text ?? ''
    };
  }, [subtitle, disabled]);

  useEffect(() => {
    if (!disabled) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [subtitle?.id, disabled]);

  const handleClose = () => {
    setSubtitleFormChanged(false);
    closeSubtitleForm();
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
        message: START_TIME_EXCEEDS_DURATION_MESSAGE
      });
      hasError = true;
    }

    if (hasDuration && endTime > duration) {
      form.setError('end', {
        message: END_TIME_EXCEEDS_DURATION_MESSAGE
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
        const start = form.watch('start');
        const end = form.watch('end');

        return (
          <>
            <SubtitleTimePointSelectionConsumer
              form={form}
              disabled={disabled}
              duration={duration}
            />
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
                  <InputField
                    control={form.control}
                    name='start'
                    label='Thời gian bắt đầu'
                    placeholder={SUBTITLE_TIME_PLACEHOLDER}
                    required
                    disabled={disabled}
                    onChange={(e) => {
                      const value = e.target.value;
                      const startTime = timeToSeconds(
                        (value as string) || SUBTITLE_TIME_PLACEHOLDER
                      );
                      const endTime = timeToSeconds(
                        (end as string) || SUBTITLE_TIME_PLACEHOLDER
                      );

                      if (startTime < endTime) {
                        form.clearErrors('end');
                      }

                      if (startTime >= duration) {
                        form.setError('start', {
                          message: START_TIME_EXCEEDS_DURATION_MESSAGE
                        });
                      } else {
                        form.clearErrors('start');
                      }

                      validateSubtitleTimeFields({
                        form,
                        field: 'start',
                        start: e.target.value,
                        end,
                        duration
                      });
                    }}
                    readOnly
                    tabIndex={-1}
                    onPointerDown={preventTimeInputPointerSelection}
                    onSelect={collapseTimeInputSelection}
                    className='cursor-default caret-transparent select-none'
                    formItemClassName='grow'
                  />
                  <ToolTip title='Chọn thời gian từ timeline' side='bottom'>
                    <Button
                      className={cn('rounded-md', {
                        'bg-sporty-blue hover:bg-sporty-blue/80 text-white hover:text-white':
                          subtitleTimePickField === 'start'
                      })}
                      size='icon'
                      type='button'
                      variant='ghost'
                      disabled={disabled}
                      aria-label='Pick start time from timeline'
                      aria-pressed={subtitleTimePickField === 'start'}
                      onClick={() => startSubtitleTimePick('start')}
                    >
                      <Crosshair />
                    </Button>
                  </ToolTip>
                </div>
              </Col>
              <Col className='grid-c-6'>
                <div className='flex items-end gap-2'>
                  <InputField
                    control={form.control}
                    name='end'
                    label='Thời gian kết thúc'
                    placeholder={SUBTITLE_TIME_PLACEHOLDER}
                    required
                    disabled={disabled}
                    onChange={(e) => {
                      const value = e.target.value;

                      const startTime = timeToSeconds(
                        (start as string) || SUBTITLE_TIME_PLACEHOLDER
                      );
                      const endTime = timeToSeconds(
                        (value as string) || SUBTITLE_TIME_PLACEHOLDER
                      );
                      if (startTime < endTime) {
                        form.clearErrors('start');
                      }
                      if (endTime > duration) {
                        form.setError('end', {
                          message: END_TIME_EXCEEDS_DURATION_MESSAGE
                        });
                      } else {
                        form.clearErrors('end');
                      }

                      validateSubtitleTimeFields({
                        form,
                        field: 'end',
                        start,
                        end: e.target.value,
                        duration
                      });
                    }}
                    readOnly
                    tabIndex={-1}
                    onPointerDown={preventTimeInputPointerSelection}
                    onSelect={collapseTimeInputSelection}
                    className='cursor-default caret-transparent select-none'
                    formItemClassName='grow'
                  />
                  <ToolTip title='Chọn thời gian từ timeline' side='bottom'>
                    <Button
                      className={cn('rounded-md', {
                        'bg-sporty-blue hover:bg-sporty-blue/80 text-white hover:text-white':
                          subtitleTimePickField === 'end'
                      })}
                      size='icon'
                      type='button'
                      variant='ghost'
                      disabled={disabled}
                      aria-label='Pick end time from timeline'
                      aria-pressed={subtitleTimePickField === 'end'}
                      onClick={() => startSubtitleTimePick('end')}
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

function SubtitleTimePointSelectionConsumer({
  form,
  disabled,
  duration
}: {
  form: UseFormReturn<SubtitleBodyType>;
  disabled: boolean;
  duration: number;
}) {
  const { subtitleTimePointSelection } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      subtitleTimePointSelection: s.subtitleTimePointSelection
    }))
  );
  const handledSelectionKeyRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!subtitleTimePointSelection) return;
    if (handledSelectionKeyRef.current === subtitleTimePointSelection.key) {
      return;
    }

    handledSelectionKeyRef.current = subtitleTimePointSelection.key;

    if (disabled) return;

    const selectedSeconds =
      duration > 0 && Number.isFinite(duration)
        ? Math.min(Math.max(subtitleTimePointSelection.seconds, 0), duration)
        : Math.max(subtitleTimePointSelection.seconds, 0);

    form.setValue(
      subtitleTimePointSelection.field,
      secondsToVttTime(selectedSeconds),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      }
    );

    const values = form.getValues();

    validateSubtitleTimeFields({
      form,
      field: subtitleTimePointSelection.field,
      start: values.start,
      end: values.end,
      duration
    });
  }, [disabled, duration, form, subtitleTimePointSelection]);

  return null;
}
