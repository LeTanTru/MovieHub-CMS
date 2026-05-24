'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  CircleUserRoundIcon,
  UploadIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-react';

import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage
} from '@/components/ui/cropper';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AvatarField, Button, ImageField } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib';
import { useFileUpload } from '@/hooks';
import { logger } from '@/logger';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController
} from 'react-hook-form';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { ApiResponseNoData } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CircleLoading } from '@/components/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Image from 'next/image';

const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 }
] as const;

type Area = { x: number; y: number; width: number; height: number };

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputType?: string
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), outputType || 'image/jpeg');
    });
  } catch (error) {
    logger.error('[GET_CROPPED_IMAGE_ERROR]', error);
    return null;
  }
}

type UploadImageFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: ReactNode;
  value?: string;
  required?: boolean;
  labelClassName?: string;
  className?: string;
  imageClassName?: string;
  size?: number;
  loading?: boolean;
  aspect?: number;
  defaultCrop?: boolean;
  originalSize?: boolean;
  allowCustomAspect?: boolean;
  avatar?: boolean;
  onChange?: (url: string) => void;
  uploadImageFn: (file: Blob) => Promise<string>;
  deleteImageFn?: (url: string) => Promise<ApiResponseNoData | undefined>;
};

export function UploadImageField<T extends FieldValues>({
  control,
  name,
  label,
  value,
  required,
  labelClassName,
  className,
  imageClassName,
  size = 70,
  loading,
  aspect = 1,
  defaultCrop = false,
  originalSize = false,
  allowCustomAspect = false,
  avatar = false,
  onChange,
  uploadImageFn,
  deleteImageFn
}: UploadImageFieldProps<T>) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [shouldCrop, setShouldCrop] = useState<boolean>(
    defaultCrop && !originalSize
  );
  const [zoom, setZoom] = useState<number>(1);
  const [customAspect, setCustomAspect] = useState<number>(aspect);
  const [keepOriginalSize, setKeepOriginalSize] =
    useState<boolean>(originalSize);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const {
    field: { value: fieldValue, onChange: fieldOnChange },
    fieldState: { error }
  } = useController({ name, control });

  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      clearFiles
    }
  ] = useFileUpload({ accept: 'image/*' });

  const previewUrl = files[0]?.preview;

  const fileId = files[0]?.id;
  const previousFileIdRef = useRef<string | null>(null);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !uploadImageFn) return;

    const fileType =
      files[0]?.file instanceof File ? files[0].file.type : undefined;
    const outputType = fileType || 'image/jpeg';

    let blob: Blob | null = null;

    if (shouldCrop && croppedAreaPixels) {
      blob = await getCroppedImg(previewUrl, croppedAreaPixels, outputType);
    } else if (files[0]?.file instanceof File) {
      blob = files[0].file;
    } else {
      const image = await createImage(previewUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), outputType)
      );
    }

    if (!blob) return;

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadImageFn(blob);
      onChange?.(uploadedUrl);
      fieldOnChange(uploadedUrl);
      setDialogOpen(false);
    } catch (error) {
      logger.error('[UPLOAD_IMAGE_ERROR]', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      if (deleteImageFn && fieldValue) {
        await deleteImageFn(fieldValue);
      }
    } catch (err) {
      logger.error('[DELETE_IMAGE_ERROR]', err);
    }
    onChange?.('');
    fieldOnChange('');
    clearFiles();
    setConfirmRemoveOpen(false);
  };

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setDialogOpen(true);
      setZoom(1);
      setCroppedAreaPixels(null);
      setCustomAspect(aspect);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={cn('relative', className)}>
        <div className='flex flex-col items-center justify-center gap-2'>
          {label && (
            <FormLabel
              className={cn(
                {
                  'text-rose-500': error?.message
                },
                labelClassName
              )}
            >
              {label}
              {required && <span className='text-rose-500'>*</span>}
            </FormLabel>
          )}
          <div
            role='button'
            className={cn(
              'group relative inline-flex cursor-pointer items-center justify-center rounded',
              {
                'border-input border-2 border-dashed transition-all transition-colors duration-200 ease-linear hover:bg-gray-100':
                  !value,
                'rounded-full': avatar,
                'border-gray-300 bg-gray-100': isDragging,
                'border-rose-500': !!error
              }
            )}
            style={{
              width: size * aspect,
              height: size
            }}
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title='Tải ảnh lên'
            data-dragging={isDragging || undefined}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFileDialog();
              }
            }}
          >
            {!!value ? (
              <div className='relative size-full'>
                {avatar ? (
                  <AvatarField
                    src={value}
                    size={size}
                    disablePreview
                    className='size-full'
                  />
                ) : (
                  <ImageField
                    disablePreview
                    src={value}
                    className={cn('size-full rounded', {
                      'bg-black': keepOriginalSize
                    })}
                    aspect={aspect}
                    width={size * aspect}
                    height={size}
                    imageClassName={cn(
                      keepOriginalSize ? 'object-contain!' : 'object-cover!',
                      imageClassName
                    )}
                  />
                )}
                {value && (
                  <ConfirmModal
                    message='Bạn có chắc chắn muốn xóa ảnh này không?'
                    onConfirm={handleRemove}
                    open={confirmRemoveOpen}
                    onOpenChange={setConfirmRemoveOpen}
                    trigger={
                      <Button
                        size='icon'
                        type='button'
                        title='Xóa ảnh'
                        className={cn(
                          'border-background absolute size-6 rounded-full border-none text-white hover:text-rose-500'
                        )}
                        style={{
                          top: avatar ? (6 * size) / 100 : -8,
                          right: avatar ? (6 * size) / 100 : -8
                        }}
                        aria-label='Remove image'
                      >
                        <XIcon className='size-5' />
                      </Button>
                    }
                  />
                )}
              </div>
            ) : loading ? (
              <CircleLoading className='stroke-main-color' />
            ) : avatar ? (
              <CircleUserRoundIcon
                strokeWidth={1}
                className='size-full max-h-1/3 max-w-1/3 stroke-gray-300 transition-all duration-200 ease-linear group-hover:stroke-gray-400'
              />
            ) : (
              <UploadIcon
                strokeWidth={1}
                className='size-full max-h-1/3 max-w-1/3 stroke-gray-300 transition-all duration-200 ease-linear group-hover:stroke-gray-400'
              />
            )}

            <label htmlFor='input' className='cursor-pointer'>
              <span className='sr-only'>Upload file</span>
              <input
                id='input'
                {...getInputProps()}
                className='sr-only'
                tabIndex={-1}
              />
            </label>
          </div>
        </div>
        {error?.message && (
          <div className='animate-in fade-in -mb-6 flex min-h-6 items-end justify-center'>
            <p className='text-sm leading-5.5 text-rose-500'>{error.message}</p>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (isUploading) return;
          setDialogOpen(open);
        }}
      >
        <DialogContent
          className='gap-0 overflow-hidden rounded-tl-sm rounded-tr-sm border-none p-0 sm:max-w-85 md:max-w-90 lg:max-w-95 xl:max-w-100 2xl:max-w-115'
          showCloseButton={false}
        >
          <DialogHeader className='text-left'>
            <DialogTitle className='border-none p-0 outline-none'></DialogTitle>
          </DialogHeader>

          <AspectRatio
            ratio={customAspect < 1 ? 1 : customAspect}
            className={cn('bg-muted h-full', {
              'bg-black': keepOriginalSize && !shouldCrop
            })}
          >
            {previewUrl && shouldCrop ? (
              <Cropper
                aspectRatio={customAspect}
                className='h-full w-full'
                image={previewUrl}
                zoom={zoom}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
              >
                <CropperDescription />
                <CropperImage />
                <CropperCropArea className='border-main-color border-2' />
              </Cropper>
            ) : (
              previewUrl && (
                <Image
                  fill
                  src={previewUrl}
                  alt='Preview'
                  className={cn('h-full w-full', {
                    'object-contain': keepOriginalSize && !shouldCrop,
                    'object-cover': !keepOriginalSize && shouldCrop
                  })}
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              )
            )}
          </AspectRatio>

          <DialogFooter className='flex flex-col flex-wrap gap-4 border-t px-4 py-6 sm:justify-between'>
            {!keepOriginalSize && (
              <div className='mx-auto flex w-full max-w-80 items-center gap-4'>
                <ZoomOutIcon className='shrink-0 opacity-60' size={16} />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  onValueChange={(val) => setZoom(val[0])}
                  showTooltip
                  className='cursor-pointer [&_span[role="slider"]]:bg-gray-500'
                />
                <ZoomInIcon className='shrink-0 opacity-60' size={16} />
              </div>
            )}

            {allowCustomAspect && shouldCrop && (
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm'>
                  Tỉ lệ khung hình:
                </span>
                <Select
                  value={customAspect.toString()}
                  onValueChange={(val) => setCustomAspect(parseFloat(val))}
                >
                  <SelectTrigger className='w-24'>
                    <SelectValue placeholder='Chọn tỉ lệ' />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ratio) => (
                      <SelectItem
                        key={ratio.value}
                        value={ratio.value.toString()}
                      >
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex w-full justify-between'>
              <div className='flex items-center gap-4'>
                <label
                  className='flex cursor-pointer items-center gap-2'
                  htmlFor='crop-image'
                >
                  <Checkbox
                    id='crop-image'
                    className='mb-0! cursor-pointer border-gray-200 border-transparent transition-colors duration-200 ease-linear focus-visible:ring-0 data-[state=checked]:border-transparent data-[state=checked]:bg-sky-700! data-[state=checked]:text-white'
                    checked={shouldCrop}
                    onCheckedChange={(checked) => {
                      setShouldCrop(!!checked);
                      setKeepOriginalSize(!checked);
                      if (!checked) {
                        setZoom(1);
                        setCustomAspect(aspect);
                      }
                    }}
                  />
                  <span className='text-sm'>Cắt ảnh</span>
                </label>
                {!!originalSize && (
                  <label
                    className='flex cursor-pointer items-center gap-2'
                    htmlFor='keep-original-size'
                  >
                    <Checkbox
                      id='keep-original-size'
                      className='mb-0! cursor-pointer border-gray-200 border-transparent transition-colors duration-200 ease-linear focus-visible:ring-0 data-[state=checked]:border-transparent data-[state=checked]:bg-sky-700! data-[state=checked]:text-white'
                      checked={keepOriginalSize}
                      onCheckedChange={(checked) => {
                        setKeepOriginalSize(!!checked);
                        setShouldCrop(!checked);
                        if (checked) {
                          setZoom(1);
                          setCustomAspect(aspect);
                        }
                      }}
                    />
                    <span className='text-sm'>Gốc</span>
                  </label>
                )}
              </div>

              <div className='flex items-center justify-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='-my-1 w-25 border-rose-500 text-rose-500 hover:border-rose-500/80 hover:text-rose-500/80 disabled:border-rose-500/80'
                  onClick={() => setDialogOpen(false)}
                  disabled={isUploading}
                >
                  Đóng
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  className='-my-1 w-25'
                  onClick={handleApply}
                  disabled={!previewUrl || loading || isUploading}
                  loading={loading || isUploading}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
