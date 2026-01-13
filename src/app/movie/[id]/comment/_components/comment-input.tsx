'use client';

import { emojiIcon } from '@/assets';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { apiConfig } from '@/constants';
import { useClickOutside, useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import type { CommentBodyType, CommentResType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function CommentInput({
  queryKey,
  movieId
}: {
  queryKey: string;
  movieId: string;
}) {
  const formRef = useRef<any>(null);

  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const wrapperRef = useClickOutside<HTMLDivElement>(() =>
    setShowPicker(false)
  );

  const pickerContainerRef = useRef<HTMLDivElement>(null);

  const { loading, handleSubmit } = useSaveBase<
    CommentResType,
    CommentBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      queryKey,
      objectName: 'bình luận',
      pathParams: {},
      mode: 'create',
      showNotify: false
    }
  });

  const defaultValues: CommentBodyType = {
    content: '',
    movieId: movieId,
    movieItemId: '',
    parentId: ''
  };

  const onSubmit = async (
    values: CommentBodyType,
    form: UseFormReturn<CommentBodyType>
  ) => {
    await handleSubmit(values);
    queryClient.invalidateQueries({ queryKey: [`${queryKey}-infinite`] });
    form.reset();
  };

  useEffect(() => {
    let picker: any;
    let mounted = true;

    (async () => {
      const { Picker } = await import('emoji-picker-element');
      const vi = (await import('emoji-picker-element/i18n/vi')).default;

      if (!mounted) return;

      picker = new Picker();
      picker.i18n = vi;
      picker.style.position = 'absolute';
      picker.style.zIndex = '1000';
      picker.style.display = 'none';
      picker.style.right = '130px';
      picker.style.top = '0px';
      picker.classList.add('rounded-lg!', 'overflow-hidden');

      picker.addEventListener('emoji-click', (event: any) => {
        const emoji = event.detail.unicode;
        if (formRef.current) {
          const currentValue = formRef.current.getValues('content') || '';
          formRef.current.setValue('content', currentValue + emoji);
        }
      });

      if (pickerContainerRef.current) {
        pickerContainerRef.current.appendChild(picker);
      }
    })();

    return () => {
      mounted = false;
      if (picker && picker.parentNode) picker.parentNode.removeChild(picker);
    };
  }, []);

  useEffect(() => {
    const pickerEl = pickerContainerRef.current?.querySelector('emoji-picker');

    if (pickerEl) {
      if (!showPicker) {
        pickerEl.style.display = 'none';
      } else {
        pickerEl.style.display = 'block';
      }
    }
  }, [showPicker]);

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      ref={formRef}
      className='-mb-4'
    >
      {(form) => {
        return (
          <>
            <Row className='mb-0'>
              <Col span={24}>
                <TextAreaField
                  control={form.control}
                  name='content'
                  placeholder='Viết bình luận'
                  className='min-h-20'
                />
              </Col>
            </Row>
            <Row className='mt-2 mb-0'>
              <Col span={24}>
                <div className='relative ml-auto w-fit' ref={wrapperRef}>
                  <div ref={pickerContainerRef} />
                  <div className='flex'>
                    <Button
                      type='button'
                      onClick={() => setShowPicker((prev) => !prev)}
                      className='flex w-fit items-center justify-center'
                      variant={'ghost'}
                      disabled={loading}
                    >
                      <Image
                        src={emojiIcon.src}
                        alt='Emoji icon'
                        width={25}
                        height={25}
                      />
                    </Button>
                    <Button
                      loading={loading}
                      variant={'primary'}
                      className='w-20!'
                      disabled={!form.watch('content')}
                    >
                      <Send />
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        );
      }}
    </BaseForm>
  );
}
