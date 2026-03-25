'use client';

import { cn } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  ComponentType,
  type HTMLAttributes,
  type MouseEvent,
  SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { defaultAvatar } from '@/assets';
import { useImageStatus, useIsMounted } from '@/hooks';
import { createPortal } from 'react-dom';
import { isMobileDevice } from '@/utils';

type AvatarFieldProps = {
  size?: number;
  // Format: [{ breakpoint: 640, size: 40 }, { breakpoint: 1024, size: 52 }]
  // Base uses `size`; matching breakpoints override it
  breakpoints?: Array<{ breakpoint: number; size: number }>;
  src?: string;
  fallbackSrc?: string;
  className?: string;
  previewClassName?: string;
  imagePreviewClassName?: string;
  disablePreview?: boolean;
  previewSize?: number;
  width?: number;
  height?: number;
  previewAspect?: number;
  alt?: string;
  zoomOnScroll?: boolean;
  hoverIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  hoverIconClassName?: string;
} & HTMLAttributes<HTMLElement>;

export default function AvatarField({
  size = 48,
  breakpoints,
  previewSize = 200,
  src,
  fallbackSrc,
  className,
  previewClassName,
  imagePreviewClassName,
  disablePreview = false,
  width,
  height,
  previewAspect = 1,
  zoomOnScroll = true,
  alt,
  hoverIcon: HoverIcon = EyeIcon,
  hoverIconClassName,
  ...props
}: AvatarFieldProps) {
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
    if (!responsiveRules.length || viewportWidth <= 0) return size;

    let next = size;
    for (const rule of responsiveRules) {
      if (viewportWidth >= rule.breakpoint) {
        next = rule.size;
      }
    }
    return next;
  }, [responsiveRules, size, viewportWidth]);

  const resolvedWidth = width || resolvedSize;
  const resolvedHeight = height || resolvedSize;

  // Preview is only available when there's a valid src
  const shouldDisablePreview = disablePreview || !src || imageError;

  // Fallback priority:
  // 1. If src is valid → AvatarImage handles it
  // 2. If alt is provided → show first char uppercased
  // 3. Otherwise → show default avatar image
  const altInitial = alt?.trim().charAt(0).toUpperCase();

  const handleClick = (e: MouseEvent) => {
    if (shouldDisablePreview) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!zoomOnScroll) return;
      setScale((prev) => {
        const next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
        return Math.max(1, Math.min(3, next));
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
        onClick={props?.onClick ?? handleClick}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!shouldDisablePreview) setOpen(true);
          }
        }}
        className={cn(
          'relative',
          { 'cursor-pointer': !shouldDisablePreview },
          className
        )}
        style={{ width: resolvedWidth, height: resolvedHeight }}
      >
        <Avatar
          className={cn('bg-image-fill shadow-sm', {
            'transition-all duration-200 ease-linear hover:scale-105 hover:opacity-90':
              !shouldDisablePreview
          })}
          style={{ width: resolvedWidth, height: resolvedHeight }}
        >
          {/* AvatarImage handles showing/hiding automatically based on src */}
          {src && (
            <AvatarImage
              src={src}
              alt={alt ?? 'Avatar'}
              className='object-cover'
            />
          )}
          {/* AvatarFallback is shown when src is empty or image fails to load */}
          <div className='flex size-full items-center justify-center'>
            {altInitial ? (
              /* Show first char of alt if available */
              <span className='text-xl leading-none font-medium'>
                {altInitial}
              </span>
            ) : (
              /* Default avatar image */
              <Image
                src={fallbackSrc || defaultAvatar}
                alt='Avatar'
                width={resolvedWidth}
                height={resolvedHeight}
                className='h-full w-full object-cover'
                unoptimized
              />
            )}
          </div>
        </Avatar>

        {!shouldDisablePreview && (
          <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-all duration-200 ease-linear hover:opacity-100'>
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
                e.stopPropagation();
                setScale(1);
                setOpen(false);
              }}
            >
              <m.div
                ref={previewRef}
                className={cn(
                  'relative cursor-zoom-in rounded',
                  previewClassName
                )}
                style={{
                  width: previewSize * previewAspect,
                  height: previewSize
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {src && (
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
                        'rounded-full object-cover transition-transform duration-100',
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
                )}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
