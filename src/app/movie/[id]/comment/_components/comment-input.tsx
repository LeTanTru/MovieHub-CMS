'use client';

import { emojiIcon } from '@/assets';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { apiConfig, queryKeys } from '@/constants';
import { useClickOutside, useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import type { CommentBodyType, CommentResType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function CommentInput({ movieId }: { movieId: string }) {
  const formMethodsRef = useRef<UseFormReturn<CommentBodyType> | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const wrapperRef = useClickOutside<HTMLDivElement>(() =>
    setShowPicker(false)
  );

  const pickerContainerRef = useRef<HTMLDivElement>(null);

  const { loading, onFormChange, handleSubmit } = useSaveBase<
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
    await queryClient.invalidateQueries({ queryKey: [`${queryKey}-infinite`] });
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
      picker.style.opacity = '0';
      picker.style.visibility = 'hidden';
      picker.style.right = '100px';
      picker.style.top = '0px';
      picker.style.transition = 'all 0.2s linear';
      picker.style.setProperty('--border-radius', '8px');
      picker.style.setProperty('--border-size', '0');

      picker.addEventListener('emoji-click', (event: any) => {
        const emoji = event.detail.unicode;
        if (formMethodsRef.current) {
          const currentValue =
            formMethodsRef.current.getValues('content') || '';
          formMethodsRef.current.setValue('content', currentValue + emoji, {
            shouldDirty: true,
            shouldTouch: true
          });
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
        pickerEl.style.opacity = '0';
        pickerEl.style.visibility = 'hidden';
      } else {
        pickerEl.style.opacity = '1';
        pickerEl.style.visibility = 'visible';
      }
    }
  }, [showPicker]);

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      onFormChange={onFormChange}
    >
      {(form) => {
        formMethodsRef.current = form;
        return (
          <>
            <Row className='mb-0'>
              <Col className='grid-c-12'>
                <TextAreaField
                  control={form.control}
                  name='content'
                  placeholder='Viết bình luận'
                  className='min-h-30'
                />
              </Col>
            </Row>
            <Row className='mt-4 mb-0'>
              <Col className='grid-c-12'>
                <div className='relative ml-auto w-fit' ref={wrapperRef}>
                  <div ref={pickerContainerRef} />
                  <div className='flex'>
                    <Button
                      type='button'
                      onClick={() => setShowPicker((prev) => !prev)}
                      className='flex h-8 w-fit items-center justify-center hover:bg-transparent'
                      variant='ghost'
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
                      variant='primary'
                      disabled={!form.watch('content') || loading}
                      className='h-8'
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
