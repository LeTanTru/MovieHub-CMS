'use client';

import {
  type MouseEvent,
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
import type { ApiResponse } from '@/types';
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
    logger.error('getCroppedImg error:', error);
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
  showCrop?: boolean;
  originalSize?: boolean;
  allowCustomAspect?: boolean;
  avatar?: boolean;
  onChange?: (url: string) => void;
  uploadImageFn: (file: Blob) => Promise<string>;
  deleteImageFn?: (url: string) => Promise<ApiResponse<any> | undefined>;
};

export default function UploadImageField<T extends FieldValues>({
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
  defaultCrop = true,
  showCrop = true,
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
    showCrop && defaultCrop && !originalSize
  );
  const [zoom, setZoom] = useState<number>(1);
  const [customAspect, setCustomAspect] = useState<number>(aspect);
  const [keepOriginalSize, setKeepOriginalSize] =
    useState<boolean>(originalSize);
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
      const uploadedUrl = await uploadImageFn(blob);
      onChange?.(uploadedUrl);
      fieldOnChange(uploadedUrl);
      setDialogOpen(false);
    } catch (error) {
      logger.error('Error while uploading image:', error);
    }
  };

  const handleRemove = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      if (deleteImageFn && fieldValue) {
        await deleteImageFn(fieldValue);
      }
    } catch (err) {
      logger.error('Error while deleting image:', err);
    }
    onChange?.('');
    fieldOnChange('');
    clearFiles();
  };

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      if (showCrop) {
        setDialogOpen(true);
        setZoom(1);
        setCroppedAreaPixels(null);
        setCustomAspect(aspect);
      } else {
        // Upload directly without showing dialog when showCrop is false
        handleApply();
      }
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  return (
    <>
      <div className={cn('relative', className)}>
        <div className='flex flex-col items-center justify-center gap-2'>
          {label && (
            <FormLabel
              className={cn(
                {
                  'text-destructive': error?.message
                },
                labelClassName
              )}
            >
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}
          <button
            type='button'
            className={cn(
              'relative inline-flex cursor-pointer items-center justify-center rounded',
              {
                'border-input border-2 border-dashed transition-all transition-colors duration-200 ease-linear hover:bg-gray-100 dark:hover:bg-gray-800':
                  !value,
                'rounded-full': avatar,
                'border-gray-300 bg-gray-100 dark:bg-gray-800': isDragging,
                'border-red-500': !!error
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
                    className={cn('size-full rounded object-cover')}
                    aspect={keepOriginalSize ? undefined : aspect}
                    width={keepOriginalSize ? undefined : size * aspect}
                    height={keepOriginalSize ? undefined : size}
                    originalSize={keepOriginalSize}
                    imageClassName={imageClassName}
                  />
                )}
                {value && (
                  <Button
                    onClick={handleRemove}
                    size='icon'
                    type='button'
                    title='Xóa ảnh'
                    className={cn(
                      'border-background absolute size-6 rounded-full border-none'
                    )}
                    style={{
                      top: avatar ? (6 * size) / 100 : -8,
                      right: avatar ? (6 * size) / 100 : -8
                    }}
                    aria-label='Remove image'
                  >
                    <XIcon className='size-5' />
                  </Button>
                )}
              </div>
            ) : loading && !showCrop ? (
              <CircleLoading className='stroke-main-color dark:stroke-white' />
            ) : avatar ? (
              <CircleUserRoundIcon
                strokeWidth={1}
                className='size-full max-h-1/3 max-w-1/3'
              />
            ) : (
              <UploadIcon
                strokeWidth={1}
                className='size-full max-h-1/3 max-w-1/3'
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
          </button>
        </div>
        {error?.message && (
          <div className='animate-in fade-in -mb-6 flex min-h-6 items-end justify-center'>
            <p className='text-destructive text-sm leading-5.5'>
              {error.message}
            </p>
          </div>
        )}
      </div>

      {showCrop && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className='gap-0 overflow-hidden rounded-tl-sm rounded-tr-sm border-none p-0 sm:max-w-85 md:max-w-90 lg:max-w-95 xl:max-w-100 2xl:max-w-115'
            showCloseButton={false}
          >
            <DialogHeader className='text-left'>
              <DialogTitle className='border-none p-0 outline-none'></DialogTitle>
            </DialogHeader>

            <AspectRatio
              ratio={customAspect < 1 ? 1 : customAspect}
              className={cn('bg-muted h-full dark:bg-black', {
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
                  <img
                    src={previewUrl}
                    alt='Preview'
                    className={cn('h-full w-full', {
                      'object-contain': keepOriginalSize && !shouldCrop,
                      'object-cover': !keepOriginalSize && shouldCrop
                    })}
                  />
                )
              )}
            </AspectRatio>

            <DialogFooter className='flex flex-col flex-wrap gap-4 border-t px-4 py-6 sm:justify-between'>
              {shouldCrop && (
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
                      className='mb-0! cursor-pointer border-gray-200 border-transparent transition-colors duration-200 ease-linear focus-visible:ring-0 data-[state=checked]:border-transparent data-[state=checked]:bg-blue-700! data-[state=checked]:text-white'
                      checked={shouldCrop}
                      onCheckedChange={(checked) => {
                        setShouldCrop(!!checked);
                        setKeepOriginalSize(false);
                        if (!checked) {
                          setZoom(1);
                          setCustomAspect(aspect);
                          setKeepOriginalSize(true);
                        }
                      }}
                    />
                    <span className='text-sm'>Cắt ảnh</span>
                  </label>
                  {originalSize && (
                    <label
                      className='flex cursor-pointer items-center gap-2'
                      htmlFor='keep-original-size'
                    >
                      <Checkbox
                        id='keep-original-size'
                        className='mb-0! cursor-pointer border-gray-200 border-transparent transition-colors duration-200 ease-linear focus-visible:ring-0 data-[state=checked]:border-transparent data-[state=checked]:bg-blue-700! data-[state=checked]:text-white'
                        checked={keepOriginalSize}
                        onCheckedChange={(checked) => {
                          setKeepOriginalSize(!!checked);
                          setShouldCrop(false);
                          if (!checked) {
                            setZoom(1);
                            setCustomAspect(aspect);
                            setShouldCrop(true);
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
                    className='hover:border-destructive/80 text-destructive border-destructive dark:border-destructive dark:text-destructive dark:hover:border-destructive/80 hover:text-destructive/80 dark:hover:text-destructive/80 -my-1 w-25'
                    onClick={() => setDialogOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    type='button'
                    variant='primary'
                    className='-my-1 w-25'
                    onClick={handleApply}
                    disabled={!previewUrl || loading}
                    loading={loading}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
