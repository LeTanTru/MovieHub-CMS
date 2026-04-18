'use client';

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent
} from 'react';
import { FileIcon, XIcon } from 'lucide-react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController
} from 'react-hook-form';

import { Button } from '@/components/form';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib';
import { useFileUpload } from '@/hooks';
import { CircleLoading } from '@/components/loading';
import { logger } from '@/logger';
import type { ApiResponse } from '@/types';
import { formatBytes } from '@/hooks/use-file-upload';

type UploadFileFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: ReactNode;
  required?: boolean;
  className?: string;
  accept: string;
  maxSize?: number; // Max file size in bytes
  onChange?: (url: string) => void;
  onUploadStart?: () => void;

  uploadFileFn: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<string>;

  deleteImageFn?: (url: string) => Promise<ApiResponse<any> | undefined>;
};

export default function UploadFileField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  accept,
  maxSize,
  onChange,
  onUploadStart,
  uploadFileFn,
  deleteImageFn
}: UploadFileFieldProps<T>) {
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
  ] = useFileUpload({ accept });

  const file = files[0]?.file as File | undefined;
  // const previewUrl = files[0]?.preview;
  const fileId = files[0]?.id;

  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [sizeError, setSizeError] = useState<string>('');

  const prevFileId = useRef<string | null>(null);

  useEffect(() => {
    if (!fileId || fileId === prevFileId.current) return;

    if (file) {
      // Check file size if maxSize is specified
      if (maxSize && file.size > maxSize) {
        const maxSizeFormatted = formatBytes(maxSize);
        const fileSizeFormatted = formatBytes(file.size);
        setSizeError(
          `Kích thước tệp quá lớn (${fileSizeFormatted}). Kích thước tối đa cho phép: ${maxSizeFormatted}`
        );
        clearFiles();
        return;
      }
      setSizeError('');
      startUpload(file);
    }
    prevFileId.current = fileId;
  }, [fileId, maxSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const startUpload = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);
      onUploadStart?.();

      const url = await uploadFileFn(file, setProgress);

      fieldOnChange(url);
      onChange?.(url);
    } catch (error) {
      logger.error('Upload file error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      if (deleteImageFn && value) {
        await deleteImageFn(value);
      }
    } catch (err) {
      logger.error('Error while deleting file:', err);
    }

    fieldOnChange('');
    onChange?.('');
    clearFiles();
    setProgress(0);
    setSizeError('');
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
        className={cn(
          'relative mb-0 flex min-h-18 cursor-pointer items-center gap-3 rounded-md border-2 border-dashed p-4 transition-all duration-200 ease-linear hover:bg-gray-100',
          {
            'border-gray-300 bg-gray-100': isDragging,
            'border border-solid border-red-500':
              (!!error || !!sizeError) && !uploading
          }
        )}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className='hidden' />

        <FileIcon
          className={cn('stroke-1 text-gray-300', {
            'text-destructive': (!!error || !!sizeError) && !uploading
          })}
        />

        <div className='flex flex-col'>
          <span className='text-sm'>
            {file ? (
              file.name
            ) : value ? (
              <span>Đã tải tệp lên</span>
            ) : (
              <span
                className={cn('text-gray-300', {
                  'text-destructive': (!!error || !!sizeError) && !uploading
                })}
              >
                {isDragging ? 'Thả tệp vào đây' : 'Chọn tệp để tải lên'}
              </span>
            )}
          </span>
          {file && (
            <span className='text-xs opacity-60'>{formatBytes(file.size)}</span>
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
          <Button
            onClick={handleRemove}
            size='icon'
            type='button'
            className='border-background absolute -top-2 -right-2 size-5 rounded-full border'
            aria-label='Remove image'
          >
            <XIcon className='size-3.5' />
          </Button>
        )}
      </div>

      {/* {previewUrl && (
        <video src={previewUrl} controls className='w-full rounded-md border' />
      )} */}

      {uploading && (
        <div className='mt-2 flex items-center gap-2'>
          <div className='flex shrink-0 items-center gap-2'>
            <CircleLoading className='stroke-main-color size-4' />
            {progress}% đang tải...
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full'>
            <div
              className='bg-main-color! skeleton h-full transition-all'
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
