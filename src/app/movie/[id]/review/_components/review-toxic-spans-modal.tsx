'use client';

import { Button, Col, Row, ToolTip } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import { queryKeys } from '@/constants';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { useUpdateReviewToxicSpansMutation } from '@/queries';
import { reviewToxicSpansSchema } from '@/schema-validations';
import type {
  ReviewResType,
  ReviewToxicSpansBodyType,
  ToxicSpan
} from '@/types';
import {
  createToxicSpanPreviews,
  createToxicSpanSegments,
  getSelectedToxicSpan,
  invalidateQueries,
  normalizeToxicSpans,
  notify,
  parseToxicSpans
} from '@/utils';
import { ArrowLeftFromLine, Highlighter, Save, Trash2, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

type ReviewToxicSpansModalProps = {
  opened: boolean;
  review: ReviewResType;
  onClose: () => void;
};

const defaultValues: ReviewToxicSpansBodyType = {
  id: '',
  toxic_spans: '[]'
};

export function ReviewToxicSpansModal({
  opened,
  review,
  onClose
}: ReviewToxicSpansModalProps) {
  const content = review.content ?? '';
  const previewRef = useRef<HTMLDivElement>(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const { mutate: updateReviewToxicSpans, isPending } =
    useUpdateReviewToxicSpansMutation();

  const initialValues = useMemo(() => {
    const parsedToxicSpans = parseToxicSpans(review.toxicSpans) ?? [];

    return {
      id: review.id ?? defaultValues.id,
      toxic_spans: JSON.stringify(
        normalizeToxicSpans(parsedToxicSpans, content.length)
      )
    };
  }, [review.id, review.toxicSpans, content.length]);

  const onSubmit = (values: ReviewToxicSpansBodyType) => {
    const parsedToxicSpans = parseToxicSpans(values.toxic_spans) ?? [];
    const toxicSpans = normalizeToxicSpans(parsedToxicSpans, content.length);

    updateReviewToxicSpans(
      {
        ...values,
        toxic_spans: JSON.stringify(toxicSpans)
      },
      {
        onSuccess: (res) => {
          if (res.result) {
            invalidateQueries([
              queryKeys.REVIEW_INFINITE,
              { movieId: review.movieId }
            ]);
            notify.success('Cập nhật nội dung độc hại thành công');
            onClose();
            return;
          }

          notify.error('Cập nhật nội dung độc hại thất bại');
        },
        onError: (error) => {
          logger.error('[UPDATE_REVIEW_TOXIC_SPANS_ERROR]', error);
          notify.error('Cập nhật nội dung độc hại thất bại');
        }
      }
    );
  };

  return (
    <Modal onClose={onClose} open={opened} confirmOnClose={isFormChanged}>
      <Modal.Header>Cập nhật nội dung độc hại</Modal.Header>
      <Modal.Body>
        <BaseForm
          defaultValues={defaultValues}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onFormChange={setIsFormChanged}
          schema={reviewToxicSpansSchema}
        >
          {(form) => {
            const currentToxicSpans = normalizeToxicSpans(
              parseToxicSpans(form.watch('toxic_spans')) ?? [],
              content.length
            );

            const toxicSpanPreviews = createToxicSpanPreviews(
              content,
              currentToxicSpans
            );

            const toxicSpanSegments = createToxicSpanSegments(
              content,
              currentToxicSpans
            );

            const setToxicSpans = (nextSpans: ToxicSpan[]) => {
              form.setValue(
                'toxic_spans',
                JSON.stringify(normalizeToxicSpans(nextSpans, content.length)),
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true
                }
              );
            };

            const handleMarkSelection = () => {
              const container = previewRef.current;

              if (!container) return;

              const selectedSpan = getSelectedToxicSpan(container);

              if (!selectedSpan) {
                notify.error('Vui lòng chọn nội dung cần đánh dấu');
                return;
              }

              setToxicSpans([...currentToxicSpans, selectedSpan]);
              window.getSelection()?.removeAllRanges();
              container.focus();
            };

            const handleRemoveSpan = (index: number) => {
              setToxicSpans(
                currentToxicSpans.filter(
                  (_, currentIndex) => currentIndex !== index
                )
              );
            };

            return (
              <>
                <input type='hidden' {...form.register('id')} />
                <input type='hidden' {...form.register('toxic_spans')} />

                <Row>
                  <Col className='grid-c-12'>
                    <div
                      ref={previewRef}
                      tabIndex={0}
                      className='focus-visible:ring-sporty-blue min-h-24 rounded-md border bg-gray-50 p-3 text-sm leading-6 wrap-break-word whitespace-pre-wrap text-gray-700 transition-all duration-200 ease-linear outline-none focus-visible:ring-2'
                    >
                      {toxicSpanSegments.length > 0
                        ? toxicSpanSegments.map((segment) => (
                            <span
                              key={`${segment.start}-${segment.end}-${segment.toxic}`}
                              data-start={segment.start}
                              data-end={segment.end}
                              data-toxic-span-segment=''
                              className={cn({
                                'rounded bg-rose-100 px-1 font-medium text-rose-700':
                                  segment.toxic
                              })}
                            >
                              {segment.text}
                            </span>
                          ))
                        : content || 'Không có nội dung đánh giá'}
                    </div>
                  </Col>
                </Row>

                <Row className='justify-end'>
                  <Col className='w-fit'>
                    <Button
                      type='button'
                      variant='primary'
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleMarkSelection}
                      disabled={content.length === 0}
                    >
                      <Highlighter />
                      Đánh dấu
                    </Button>
                  </Col>
                  <Col className='w-fit'>
                    <Button
                      type='button'
                      variant='destructive'
                      onClick={() => setToxicSpans([])}
                      disabled={currentToxicSpans.length === 0}
                    >
                      <Trash2 />
                      Xóa tất cả
                    </Button>
                  </Col>
                </Row>

                <Row>
                  <Col className='grid-c-12'>
                    <div className='rounded-md border'>
                      <div className='border-b p-2 text-sm font-medium'>
                        Danh sách từ khóa độc hại
                      </div>
                      {toxicSpanPreviews.length > 0 ? (
                        <div className='divide-y'>
                          {toxicSpanPreviews.map((span, index) => (
                            <div
                              key={`${span.start}-${span.end}-${index}`}
                              className='grid grid-cols-[1fr_auto] gap-2 p-2 text-sm'
                            >
                              <div className='min-w-0'>
                                <div className='mt-1 rounded bg-rose-50 px-2 py-1 wrap-break-word text-rose-700'>
                                  {span.text || 'Không có nội dung'}
                                </div>
                              </div>
                              <ToolTip title='Xóa'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  aria-label={`Xóa từ khóa độc hại ${span.text}`}
                                  onClick={() => handleRemoveSpan(index)}
                                  className='w-fit gap-0 text-rose-500 hover:bg-transparent hover:text-rose-500/50'
                                >
                                  <X />
                                </Button>
                              </ToolTip>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='px-3 py-4 text-sm text-gray-500'>
                          Chưa có từ khóa độc hại nào.
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row className='mb-0 justify-end'>
                  <Col className='w-40'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={onClose}
                      className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50 disabled:border-rose-500/50 disabled:text-rose-500/50 disabled:hover:border-rose-500/50 disabled:hover:text-rose-500/50'
                    >
                      <ArrowLeftFromLine />
                      Hủy
                    </Button>
                  </Col>
                  <Col className='w-40'>
                    <Button
                      disabled={!isFormChanged || isPending}
                      type='submit'
                      variant='primary'
                      loading={isPending}
                    >
                      <Save />
                      Cập nhật
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
