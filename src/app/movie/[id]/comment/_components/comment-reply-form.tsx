'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useClickOutside, useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import { apiConfig } from '@/constants';
import { CommentBodyType, CommentResType } from '@/types';
import { emojiIcon } from '@/assets';

type Props = {
  parentId: string;
  movieId: string;
  queryKey: string;
  onSubmitted?: () => void;
};

export default function CommentReplyForm({
  parentId,
  movieId,
  queryKey,
  onSubmitted
}: Props) {
  const formRef = useRef<any>(null);
  const wrapperRef = useClickOutside<HTMLDivElement>(() =>
    setShowPicker(false)
  );
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  const [showPicker, setShowPicker] = useState(false);

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
    movieId,
    movieItemId: '',
    parentId: parentId
  };

  const onSubmit = async (values: CommentBodyType) => {
    await handleSubmit(values);
    if (onSubmitted) onSubmitted();
    formRef.current.reset();
    setShowPicker(false);
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
      picker.style.right = '0px';
      picker.style.top = '0px';
      picker.classList.add('rounded-lg!', 'overflow-hidden');

      picker.addEventListener('emoji-click', (event: any) => {
        const emoji = event.detail.unicode;
        if (formRef.current) {
          const currentValue = formRef.current.getValues('content') || '';
          formRef.current.setValue('content', currentValue + emoji);
        }
      });

      if (pickerContainerRef.current)
        pickerContainerRef.current.appendChild(picker);
    })();

    return () => {
      mounted = false;
      if (picker && picker.parentNode) picker.parentNode.removeChild(picker);
    };
  }, []);

  useEffect(() => {
    const pickerEl = pickerContainerRef.current?.querySelector('emoji-picker');
    if (pickerEl) pickerEl.style.display = showPicker ? 'block' : 'none';
  }, [showPicker]);

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={commentSchema}
      onSubmit={onSubmit}
    >
      {(form) => {
        formRef.current = form;
        return (
          <Row className='mt-2 mb-0'>
            <Col span={24}>
              <TextAreaField
                control={form.control}
                name='content'
                placeholder='Viết phản hồi...'
              />
              <div
                className='relative mt-2 flex items-center justify-end gap-2'
                ref={wrapperRef}
              >
                <div ref={pickerContainerRef} />
                <Button
                  type='button'
                  onClick={() => setShowPicker((prev) => !prev)}
                  variant='ghost'
                  className='flex items-center justify-center'
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
                  type='submit'
                  variant='primary'
                  className='w-20!'
                  loading={loading}
                  disabled={!form.watch('content')}
                >
                  <Send />
                </Button>
              </div>
            </Col>
          </Row>
        );
      }}
    </BaseForm>
  );
}
