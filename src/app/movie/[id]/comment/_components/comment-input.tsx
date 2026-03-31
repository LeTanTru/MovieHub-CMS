'use client';

import { emojiIcon } from '@/assets';
import { Button, Col, Row, TextAreaField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { apiConfig } from '@/constants';
import { useSaveBase } from '@/hooks';
import { commentSchema } from '@/schemaValidations';
import type { CommentBodyType, CommentResType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import Image from 'next/image';
import type { UseFormReturn } from 'react-hook-form';
import { EmojiPicker } from '@/components/emoji-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

export default function CommentInput({
  queryKey,
  movieId
}: {
  queryKey: string;
  movieId: string;
}) {
  const queryClient = useQueryClient();

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

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={commentSchema}
      onSubmit={onSubmit}
      onFormChange={onFormChange}
    >
      {(form) => {
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
                <div className='flex justify-end gap-4'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        className='flex h-8 w-fit items-center justify-center p-0 hover:bg-transparent'
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
                    </PopoverTrigger>
                    <PopoverContent
                      align='end'
                      className='w-fit border-none p-0'
                    >
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
                    loading={loading}
                    variant='primary'
                    disabled={!form.watch('content') || loading}
                    className='h-8'
                    iconClassName='size-4'
                  >
                    <Send />
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        );
      }}
    </BaseForm>
  );
}
