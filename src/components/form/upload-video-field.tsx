'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { VideoIcon, XIcon } from 'lucide-react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController
} from 'react-hook-form';

import { Button } from '@/components/form/button';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib';
import { useFileUpload, formatBytes } from '@/hooks/use-file-upload';
import { CircleLoading } from '@/components/loading';
import { logger } from '@/logger';
import type { ApiResponse } from '@/types';
import { ConfirmModal } from '@/components/modal';

type UploadVideoFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: ReactNode;
  onChange?: (url: string) => void;
  onUploadStart?: () => void;
  required?: boolean;
  className?: string;
  maxSize?: number;
  uploadVideoFn: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<string>;
  deleteImageFn?: (url: string) => Promise<ApiResponse<unknown> | undefined>;
};

export function UploadVideoField<T extends FieldValues>({
  control,
  name,
  label,
  onChange,
  onUploadStart,
  required,
  className,
  maxSize,
  uploadVideoFn,
  deleteImageFn
}: UploadVideoFieldProps<T>) {
  const {
    field: { value, onChange: fieldOnChange },
    fieldState: { error }
  } = useController({ name, control });

  const [
    { files, isDragging },
    {
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      clearFiles
    }
  ] = useFileUpload({ accept: 'video/*' });

  const file = files[0]?.file as File | undefined;
  const fileId = files[0]?.id;

  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sizeError, setSizeError] = useState<string>('');
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState<boolean>(false);

  const prevFileId = useRef<string | null>(null);
  const uploadStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!fileId || fileId === prevFileId.current) return;

    if (file) {
      if (maxSize && file.size > maxSize) {
        const maxSizeFormatted = formatBytes(maxSize);
        const fileSizeFormatted = formatBytes(file.size);
        setSizeError(
          `Kích thước video quá lớn (${fileSizeFormatted}). Kích thước tối đa cho phép: ${maxSizeFormatted}`
        );
        clearFiles();
        return;
      }

      setSizeError('');
      startUpload(file);
    }

    prevFileId.current = fileId;
  }, [fileId, maxSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!uploading || !uploadStartTimeRef.current) return;

    const interval = window.setInterval(() => {
      if (!uploadStartTimeRef.current) return;

      setElapsedSeconds(
        Math.floor((Date.now() - uploadStartTimeRef.current) / 1000)
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [uploading]);

  const startUpload = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      setElapsedSeconds(0);
      uploadStartTimeRef.current = Date.now();
      onUploadStart?.();

      const url = await uploadVideoFn(file, setProgress);

      fieldOnChange(url);
      onChange?.(url);
    } catch (error) {
      logger.error('[UPLOAD_VIDEO_ERROR]', error);
    } finally {
      setUploading(false);
      uploadStartTimeRef.current = null;
    }
  };

  const handleRemove = async () => {
    try {
      if (deleteImageFn && value) {
        await deleteImageFn(value);
      }
    } catch (err) {
      logger.error('[DELETE_VIDEO_ERROR]', err);
    }

    fieldOnChange('');
    onChange?.('');
    clearFiles();
    setProgress(0);
    setElapsedSeconds(0);
    setSizeError('');
    setConfirmRemoveOpen(false);
  };

  return (
    <>
      {label && (
        <FormLabel
          className={cn(
            'mb-2 ml-2',
            error && !uploading && 'text-destructive',
            className
          )}
        >
          {label}
          {required && <span className='text-destructive'>*</span>}
        </FormLabel>
      )}

      <div
        role='button'
        className={cn(
          'relative mb-0 flex min-h-18 cursor-pointer items-center gap-3 rounded-md border-2 border-dashed p-4 transition-all duration-200 ease-linear hover:bg-gray-100',
          {
            'border-gray-300 bg-gray-100': isDragging,
            'border border-solid border-rose-500':
              (!!error || !!sizeError) && !uploading
          }
        )}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className='hidden' />

        <VideoIcon
          className={cn('stroke-1 text-gray-300', {
            'text-destructive': (!!error || !!sizeError) && !uploading
          })}
        />

        <div className='flex flex-col'>
          <span className='text-sm'>
            {file ? (
              file.name
            ) : value ? (
              <span>Đã tải video</span>
            ) : (
              <span
                className={cn('text-gray-300', {
                  'text-destructive': (!!error || !!sizeError) && !uploading
                })}
              >
                {isDragging ? 'Thả video vào đây' : 'Chọn video để tải lên'}
              </span>
            )}
          </span>
          {file && (
            <span className='text-xs opacity-60'>{formatBytes(file.size)}</span>
          )}
          {!uploading && elapsedSeconds > 0 && (
            <span className='text-xs opacity-60'>
              Thời gian tải lên: {elapsedSeconds}s
            </span>
          )}
          {maxSize && !file && !value && (
            <span
              className={cn('text-xs text-gray-300', {
                'text-destructive': (!!error || !!sizeError) && !uploading
              })}
            >
              Kích thước tối đa: {formatBytes(maxSize)}
            </span>
          )}
        </div>

        {value && !uploading && (
          <ConfirmModal
            message='Bạn có chắc chắn muốn xóa video này không ?'
            onConfirm={handleRemove}
            open={confirmRemoveOpen}
            onOpenChange={setConfirmRemoveOpen}
            trigger={
              <Button
                size='icon'
                type='button'
                className='border-background absolute -top-2 -right-2 size-5 rounded-full border'
                aria-label='Remove video'
              >
                <XIcon className='size-3.5' />
              </Button>
            }
          />
        )}
      </div>

      {uploading && (
        <div className='mt-2 flex items-center gap-2'>
          <div className='flex shrink-0 items-center gap-2'>
            <CircleLoading className='stroke-sporty-blue size-4' />
            <span>{progress}% đang tải...</span>
            <span className='text-xs opacity-70'>{elapsedSeconds}s</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full'>
            <div
              className='bg-sporty-blue! skeleton h-full transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {sizeError && !uploading && (
        <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
          <p className='text-destructive text-sm leading-5.5'>{sizeError}</p>
        </div>
      )}

      {error?.message && !uploading && !sizeError && (
        <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
          <p className='text-destructive text-sm leading-5.5'>
            {error.message}
          </p>
        </div>
      )}
    </>
  );
}
