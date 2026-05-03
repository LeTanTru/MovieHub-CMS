'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useClickOutside, useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import { apiConfig, objectNames, queryKeys } from '@/constants';
import type { CommentBodyType, CommentResType } from '@/types';
import { emojiIcon } from '@/assets';
import { useCommentStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

type CommentFormProps = {
  parentId: string;
  movieId: string;
  defaultMention?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export default function CommentForm({
  parentId,
  movieId,
  defaultMention,
  onSubmitted,
  onCancel
}: CommentFormProps) {
  const formMethodsRef = useRef<UseFormReturn<CommentBodyType> | null>(null);
  const wrapperRef = useClickOutside<HTMLDivElement>(() =>
    setShowPicker(false)
  );
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { editingComment, replyingComment, setEditingComment } =
    useCommentStore(
      useShallow((s) => ({
        editingComment: s.editingComment,
        replyingComment: s.replyingComment,
        setEditingComment: s.setEditingComment
      }))
    );

  const authorInfo = replyingComment?.author;

  const { loading, handleSubmit } = useSaveBase<
    CommentResType,
    CommentBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      queryKey: queryKeys.COMMENT,
      objectName: objectNames.COMMENT,
      pathParams: { id: editingComment?.id },
      mode: editingComment === null ? 'create' : 'edit',
      showNotify: false
    }
  });

  const defaultValues: CommentBodyType = {
    content: '',
    movieId,
    movieItemId: '',
    parentId: parentId,
    replyToId: ''
  };

  const initialValues: CommentBodyType = useMemo(
    () => ({
      content: editingComment?.content ?? '',
      movieId: editingComment?.movieId?.toString() ?? movieId,
      movieItemId: editingComment?.movieId?.toString() ?? '',
      parentId: editingComment?.parent?.id?.toString() ?? parentId,
      replyToId: authorInfo?.id?.toString() ?? ''
    }),
    [
      authorInfo?.id,
      editingComment?.content,
      editingComment?.movieId,
      editingComment?.parent?.id,
      movieId,
      parentId
    ]
  );

  const onSubmit = async (values: CommentBodyType) => {
    await handleSubmit({
      ...values
    });

    if (onSubmitted) onSubmitted();
    formMethodsRef.current?.reset();
    setShowPicker(false);
    setEditingComment(null);
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
      picker.style.right = '170px';
      picker.style.top = '5px';
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
      initialValues={initialValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      className='shadow-[0px_0px_2px_2px] shadow-gray-200'
    >
      {(form) => {
        formMethodsRef.current = form;
        return (
          <Row className='mb-0'>
            <Col className='grid-c-12'>
              <TextAreaField
                control={form.control}
                name='content'
                placeholder='Viết phản hồi...'
                className='min-h-30'
                label={
                  <span className='rounded bg-blue-50 px-1.5 py-1 font-semibold text-blue-600'>
                    {defaultMention}
                  </span>
                }
                labelClassName='m-0 mb-1 ml-0.5'
              />
              <div
                className='relative mt-4 flex items-center justify-end gap-4'
                ref={wrapperRef}
              >
                <div ref={pickerContainerRef} />
                <Button
                  type='button'
                  onClick={() => setShowPicker((prev) => !prev)}
                  variant='ghost'
                  className='flex h-8 items-center justify-center p-0 hover:bg-transparent'
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
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  className='border-destructive text-destructive hover:text-destructive/50 hover:border-destructive/50'
                  size='sm'
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  loading={loading}
                  disabled={
                    !form.watch('content') ||
                    !form.formState.validatingFields ||
                    loading
                  }
                  iconClassName='size-4'
                  className='h-8'
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
