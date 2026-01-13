'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useClickOutside, useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import { apiConfig } from '@/constants';
import type { AuthorInfoType, CommentBodyType, CommentResType } from '@/types';
import { emojiIcon } from '@/assets';
import { useCommentStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

type CommentReplyFormProps = {
  parentId: string;
  movieId: string;
  queryKey: string;
  defaultMention?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export default function CommentReplyForm({
  parentId,
  movieId,
  queryKey,
  defaultMention,
  onSubmitted,
  onCancel
}: CommentReplyFormProps) {
  const formRef = useRef<any>(null);
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

  const authorInfo = replyingComment
    ? (JSON.parse(replyingComment?.authorInfo) as AuthorInfoType)
    : null;

  const { loading, handleSubmit } = useSaveBase<
    CommentResType,
    CommentBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      queryKey,
      objectName: 'bình luận',
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
    replyToId: '',
    replyToKind: 0
  };

  const initialValues: CommentBodyType = useMemo(
    () => ({
      content: editingComment?.content || '',
      movieId: editingComment?.movieId?.toString() || movieId,
      movieItemId: editingComment?.movieId?.toString() || '',
      parentId: editingComment?.parent?.id?.toString() || parentId,
      replyToId: authorInfo?.id?.toString() || '',
      replyToKind: authorInfo?.kind || 0
    }),
    [
      authorInfo?.id,
      authorInfo?.kind,
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
    formRef.current.reset();
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
      initialValues={initialValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      className='shadow-[0px_0px_2px_2px] shadow-gray-200'
      ref={formRef}
    >
      {(form) => {
        return (
          <Row className='mb-0'>
            <Col span={24}>
              <TextAreaField
                control={form.control}
                name='content'
                placeholder='Viết phản hồi...'
                className='min-h-20'
                label={
                  <span className='rounded bg-blue-50 px-1.5 py-1 font-semibold text-blue-600'>
                    {defaultMention}
                  </span>
                }
                labelClassName='m-0 mb-1 ml-0.5'
              />
              <div
                className='relative mt-4 flex items-center justify-end gap-2'
                ref={wrapperRef}
              >
                <div ref={pickerContainerRef} />
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  className='border-destructive text-destructive hover:text-destructive/50 hover:border-destructive/50 w-20!'
                >
                  Hủy
                </Button>
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
                  disabled={
                    !form.watch('content') || !form.formState.validatingFields
                  }
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
