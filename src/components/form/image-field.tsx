'use client';

import { cn } from '@/lib/utils';
import { EyeIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  type ComponentType,
  type HTMLAttributes,
  type MouseEvent,
  type SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useImageStatus, useIsMounted } from '@/hooks';
import { createPortal } from 'react-dom';
import { isMobileDevice } from '@/utils';

type ImageFieldProps = {
  src?: string;
  alt?: string;
  size?: number;
  // Format: [{ breakpoint: 640, size: 220 }, { breakpoint: 1024, size: 320 }]
  // Base uses `size`; matching breakpoints override it
  breakpoints?: Array<{ breakpoint: number; size: number }>;
  width?: number;
  height?: number;
  aspect?: number;
  previewAspect?: number;
  previewSize?: number;
  disablePreview?: boolean;
  originalSize?: boolean;
  /** Render the thumbnail without a fixed aspect ratio — lets it grow to its natural size */
  freeAspect?: boolean;
  /** Render the preview overlay without a fixed aspect ratio — sizes to the image's natural dimensions */
  freePreviewAspect?: boolean;
  className?: string;
  imageClassName?: string;
  previewClassName?: string;
  imagePreviewClassName?: string;
  hoverIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  hoverIconClassName?: string;
  zoomOnScroll?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default function ImageField({
  src,
  alt = 'Image',
  size,
  breakpoints,
  width,
  height,
  aspect = 1,
  previewAspect = 16 / 9,
  previewSize = 500,
  disablePreview = false,
  originalSize = false,
  freeAspect = false,
  freePreviewAspect = false,
  className,
  imageClassName,
  previewClassName,
  imagePreviewClassName,
  hoverIcon: HoverIcon = EyeIcon,
  hoverIconClassName,
  zoomOnScroll = true,
  ...props
}: ImageFieldProps) {
  const isMounted = useIsMounted();
  const [open, setOpen] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  const { isError: imageError } = useImageStatus(src);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const responsiveRules = useMemo(() => {
    if (!breakpoints?.length)
      return [] as Array<{ breakpoint: number; size: number }>;

    return [...breakpoints]
      .filter(
        (rule) =>
          typeof rule?.breakpoint === 'number' && typeof rule?.size === 'number'
      )
      .sort((a, b) => a.breakpoint - b.breakpoint);
  }, [breakpoints]);

  const resolvedSize = useMemo(() => {
    if (!responsiveRules.length || viewportWidth <= 0 || size === undefined) {
      return size;
    }

    let next = size;
    for (const rule of responsiveRules) {
      if (viewportWidth >= rule.breakpoint) {
        next = rule.size;
      }
    }
    return next;
  }, [responsiveRules, size, viewportWidth]);

  const resolvedWidth = width ?? resolvedSize;
  const resolvedHeight = height ?? resolvedSize;

  const shouldDisablePreview = disablePreview || !src || imageError;

  const openPreview = (e: MouseEvent) => {
    if (shouldDisablePreview) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!zoomOnScroll) return;

      setScale((prev) => {
        let next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
        next = Math.max(1, Math.min(3, next));
        return next;
      });
    },
    [zoomOnScroll]
  );

  useEffect(() => {
    if (!open || !previewRef.current) return;

    const node = previewRef.current;
    node.addEventListener('wheel', handleWheel, { passive: true });

    return () => node.removeEventListener('wheel', handleWheel);
  }, [handleWheel, open]);

  // Lock body scroll without layout shift when modal opens
  useEffect(() => {
    if (!open) return;

    if (isMobileDevice()) document.body.classList.add('body-lock', 'mobile');
    else document.body.classList.add('body-lock');
    return () => {
      document.body.classList.remove('body-lock');
      document.body.classList.remove('body-lock', 'mobile');
    };
  }, [open]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();

    if (!responsiveRules.length) return;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responsiveRules.length]);

  if (!isMounted) return null;

  return (
    <>
      <div
        {...props}
        onClick={props?.onClick ?? openPreview}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!shouldDisablePreview) setOpen(true);
          }
        }}
        className={cn(
          'relative flex items-center justify-center rounded bg-gray-100 select-none dark:bg-black/15',
          {
            'cursor-pointer': !shouldDisablePreview,
            'flex items-center justify-center bg-black': originalSize,
            'size-full border': !src || imageError
          },
          className
        )}
      >
        {src && !imageError ? (
          originalSize ? (
            // originalSize: unconstrained, natural dimensions
            <Image
              src={src}
              alt={alt}
              width={0}
              height={0}
              sizes='100vw'
              className={cn(
                'rounded object-contain',
                'h-auto w-auto max-w-full',
                imageClassName
              )}
              unoptimized
            />
          ) : freeAspect ? (
            // freeAspect: no AspectRatio wrapper, image sizes to its natural dimensions
            <Image
              src={src}
              alt={alt}
              width={0}
              height={0}
              sizes='100vw'
              className={cn(
                'h-auto w-full rounded object-contain',
                imageClassName
              )}
              unoptimized
            />
          ) : aspect ? (
            <AspectRatio
              style={{ width: resolvedWidth, height: resolvedHeight }}
              ratio={aspect}
              className='h-full w-full'
            >
              <Image
                src={src}
                alt={alt}
                fill
                className={cn('rounded object-cover', imageClassName)}
                sizes='(max-width: 768px) 100vw, 50vw'
                unoptimized
              />
            </AspectRatio>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={resolvedWidth}
              height={resolvedHeight}
              className={cn(
                'rounded object-cover',
                {
                  'h-full w-full':
                    !imageClassName && !resolvedWidth && !resolvedHeight
                },
                imageClassName
              )}
              unoptimized
            />
          )
        ) : (
          <div className='flex h-full w-full items-center justify-center opacity-50'>
            <ImageIcon className='max-h-1/2 max-w-1/2' />
          </div>
        )}

        {!shouldDisablePreview && (
          <div className='absolute inset-0 flex items-center justify-center rounded bg-black/30 opacity-0 transition-opacity duration-200 ease-linear hover:opacity-100'>
            <HoverIcon
              className={cn(
                'max-h-1/2 max-w-1/2 text-white',
                hoverIconClassName
              )}
            />
          </div>
        )}
      </div>
      {createPortal(
        <AnimatePresence>
          {open && !shouldDisablePreview && (
            <m.div
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                setScale(1);
                setOpen(false);
                e.stopPropagation();
              }}
            >
              <m.div
                ref={previewRef}
                className={cn(
                  'relative cursor-zoom-in rounded',
                  previewClassName
                )}
                // freePreviewAspect: omit explicit width/height so the
                // container sizes naturally around the image
                style={
                  freePreviewAspect
                    ? { maxWidth: '90vw', maxHeight: '90vh' }
                    : {
                        width: previewSize * previewAspect,
                        height: previewSize
                      }
                }
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {src &&
                  (freePreviewAspect ? (
                    // freePreviewAspect: render at natural size capped to viewport
                    <Image
                      src={src}
                      alt='Preview'
                      width={0}
                      height={0}
                      sizes='90vw'
                      className={cn(
                        'h-auto max-h-[90vh] w-auto max-w-[90vw] rounded object-contain transition-transform duration-100',
                        imagePreviewClassName
                      )}
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center'
                      }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className='relative'
                      style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'visible'
                      }}
                    >
                      <Image
                        src={src}
                        alt='Preview'
                        fill
                        className={cn(
                          'rounded object-cover transition-transform duration-100',
                          imagePreviewClassName
                        )}
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin: 'center center'
                        }}
                        sizes='(max-width: 768px) 100vw, 50vw'
                        unoptimized
                      />
                    </div>
                  ))}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
