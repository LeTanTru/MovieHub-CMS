'use client';

import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import { apiConfig } from '@/constants';
import type { CommentBodyType, CommentResType } from '@/types';
import { emojiIcon } from '@/assets';
import { useCommentStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { EmojiPicker } from '@/components/emoji-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

type CommentFormProps = {
  parentId: string;
  movieId: string;
  queryKey: string;
  defaultMention?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export default function CommentForm({
  parentId,
  movieId,
  queryKey,
  defaultMention,
  onSubmitted,
  onCancel
}: CommentFormProps) {
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

  const onSubmit = async (
    values: CommentBodyType,
    form: UseFormReturn<CommentBodyType>
  ) => {
    await handleSubmit(values);

    if (onSubmitted) onSubmitted();
    form.reset();
    setEditingComment(null);
  };

  return (
    <BaseForm
      defaultValues={defaultValues}
      initialValues={initialValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      className='shadow-[0px_0px_2px_2px] shadow-gray-200'
    >
      {(form) => {
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
              <div className='relative mt-4 flex items-center justify-end gap-4'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      className='flex w-fit items-center justify-center p-0 hover:bg-transparent'
                      disabled={loading}
                      size='sm'
                    >
                      <Image
                        src={emojiIcon.src}
                        alt='Emoji icon'
                        width={25}
                        height={25}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align='end' className='w-fit border-none p-0'>
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        form.setValue(
                          'content',
                          `${form.getValues('content')}${emoji.native}`,
                          { shouldDirty: true }
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
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
                  disabled={!form.watch('content') || loading}
                  className='h-8'
                  iconClassName='size-4'
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
