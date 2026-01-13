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
  onChange?: (url: string) => void;

  uploadFileFn: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<string>;

  deleteImageFn?: (url: string) => Promise<ApiResponse<any>>;
};

export default function UploadFileField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  accept,
  onChange,
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
  const previewUrl = files[0]?.preview;
  const fileId = files[0]?.id;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const prevFileId = useRef<string | null>(null);

  useEffect(() => {
    if (!fileId || fileId === prevFileId.current) return;

    if (file) startUpload(file);
    prevFileId.current = fileId;
  }, [fileId]);

  const startUpload = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

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
    e.preventDefault();
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
  };

  return (
    <div className='space-y-1'>
      {label && (
        <FormLabel
          className={cn(
            'mb-2 ml-2 flex items-center gap-1',
            error && 'text-destructive',
            className
          )}
        >
          {label}
          {required && <span className='text-destructive'>*</span>}
        </FormLabel>
      )}

      <div
        className={cn(
          'bg-muted/30 hover:bg-accent/50 relative mb-0 flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed p-4 transition-all duration-200 ease-linear',
          isDragging && 'border-primary bg-primary/10',
          {
            'border border-solid border-red-500': !!error && !uploading
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
            'text-destructive': !!error && !uploading
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
                className={cn('font-medium text-gray-300', {
                  'text-destructive': !!error && !uploading
                })}
              >
                Chọn tệp để tải lên
              </span>
            )}
          </span>
          {file && (
            <span className='text-xs opacity-60'>{formatBytes(file.size)}</span>
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

      {uploading && (
        <div className='mt-2 h-2 w-full overflow-hidden rounded-full'>
          <div
            className='bg-dodger-blue! skeleton h-full transition-all'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className='flex items-center gap-2'>
        {uploading && (
          <div className='flex items-center gap-2 text-sm'>
            <CircleLoading className='stroke-dodger-blue' />
            {progress}% đang tải...
          </div>
        )}
      </div>

      {error?.message && !uploading && (
        <p className='text-destructive ml-2 text-sm'>{error.message}</p>
      )}
    </div>
  );
}
