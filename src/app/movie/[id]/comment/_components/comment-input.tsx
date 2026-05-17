'use client';

import {
  EMOJI_ICON_SIZE,
  EMOJI_PICKER_TOP_OFFSET,
  EMOJI_PICKER_TRANSITION_DURATION,
  EMOJI_PICKER_Z_INDEX,
  apiConfig,
  objectNames,
  queryKeys
} from '@/constants';
import { BaseForm } from '@/components/form/base-form';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { commentSchema } from '@/schemaValidations';
import { emojiIcon } from '@/assets';
import { Send } from 'lucide-react';
import { useClickOutside, useSaveBase } from '@/hooks';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { CommentBodyType, CommentResType } from '@/types';
import type { UseFormReturn } from 'react-hook-form';
import { invalidateQueries } from '@/utils';

type CommentInputProps = { movieId: string };

export default function CommentInput({ movieId }: CommentInputProps) {
  const formMethodsRef = useRef<UseFormReturn<CommentBodyType> | null>(null);

  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const showPickerRef = useRef(false);

  const togglePicker = (show?: boolean) => {
    showPickerRef.current = show !== undefined ? show : !showPickerRef.current;
    const pickerEl = pickerContainerRef.current?.querySelector(
      'emoji-picker'
    ) as HTMLElement;
    if (pickerEl) {
      Object.assign(pickerEl.style, {
        opacity: showPickerRef.current ? '1' : '0',
        visibility: showPickerRef.current ? 'visible' : 'hidden'
      });
    }
  };

  const wrapperRef = useClickOutside<HTMLDivElement>(() => togglePicker(false));

  const { loading, onFormChange, handleSubmit } = useSaveBase<
    CommentResType,
    CommentBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      queryKey: queryKeys.COMMENT,
      objectName: objectNames.COMMENT,
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
    invalidateQueries([queryKeys.COMMENT_INFINITE, { movieId }]);
    form.reset();
  };

  useEffect(() => {
    let picker: any;
    let mounted = true;

    const handleEmojiClick = (event: any) => {
      const emoji = event.detail.unicode;
      if (formMethodsRef.current) {
        const currentValue = formMethodsRef.current.getValues('content') || '';
        formMethodsRef.current.setValue('content', currentValue + emoji, {
          shouldDirty: true,
          shouldTouch: true
        });
      }
    };

    (async () => {
      const { Picker } = await import('emoji-picker-element');
      const vi = (await import('emoji-picker-element/i18n/vi')).default;

      if (!mounted) return;

      picker = new Picker();
      picker.i18n = vi;
      Object.assign(picker.style, {
        position: 'absolute',
        zIndex: String(EMOJI_PICKER_Z_INDEX),
        opacity: '0',
        visibility: 'hidden',
        right: '100px',
        top: `${EMOJI_PICKER_TOP_OFFSET}px`,
        transition: `all ${EMOJI_PICKER_TRANSITION_DURATION} linear`
      });
      picker.style.setProperty('--border-radius', '8px');
      picker.style.setProperty('--border-size', '0');

      picker.addEventListener('emoji-click', handleEmojiClick);

      if (pickerContainerRef.current) {
        pickerContainerRef.current.appendChild(picker);
      }
    })();

    return () => {
      mounted = false;
      if (picker) {
        picker.removeEventListener('emoji-click', handleEmojiClick);
        if (picker.parentNode) picker.parentNode.removeChild(picker);
      }
    };
  }, []);

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
                      onClick={() => togglePicker()}
                      className='flex h-8 w-fit items-center justify-center hover:bg-transparent'
                      variant='ghost'
                      disabled={loading}
                    >
                      <Image
                        src={emojiIcon.src}
                        alt='Emoji icon'
                        width={EMOJI_ICON_SIZE}
                        height={EMOJI_ICON_SIZE}
                      />
                    </Button>
                    <Button
                      loading={loading}
                      variant='primary'
                      disabled={!form.watch('content') || loading}
                      className='h-8'
                      iconClassName='size-4'
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
