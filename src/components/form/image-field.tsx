'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AiOutlineFileImage } from 'react-icons/ai';

type ImageFieldProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  aspect?: number;
  previewAspect?: number;
  previewSize?: number;
  disablePreview?: boolean;
  className?: string;
  previewClassName?: string;
  imagePreviewClassName?: string;
  hoverIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  showHoverIcon?: boolean;
  zoomOnScroll?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ImageField({
  src,
  alt = 'Image',
  width,
  height,
  aspect = 1,
  previewAspect = 16 / 9,
  previewSize = 500,
  disablePreview = false,
  className,
  previewClassName,
  imagePreviewClassName,
  hoverIcon: HoverIcon = EyeIcon,
  showHoverIcon = true,
  zoomOnScroll = true,
  ...props
}: ImageFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scale, setScale] = React.useState(1);

  const previewRef = React.useRef<HTMLDivElement | null>(null);

  const openPreview = (e: React.MouseEvent) => {
    if (disablePreview || !src) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleWheel = (e: WheelEvent) => {
    if (!zoomOnScroll) return;

    e.preventDefault();

    setScale((prev) => {
      let next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
      next = Math.max(1, Math.min(3, next));
      return next;
    });
  };

  React.useEffect(() => {
    if (!isOpen || !previewRef.current) return;

    const node = previewRef.current;
    node.addEventListener('wheel', handleWheel, { passive: false });

    return () => node.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  return (
    <>
      <div
        {...props}
        onClick={props?.onClick ?? openPreview}
        className={cn(
          'relative rounded border bg-gray-100 shadow-sm select-none',
          { 'cursor-pointer': !!src },
          className
        )}
        style={{ width, height }}
      >
        {src ? (
          aspect ? (
            <AspectRatio
              style={{ width, height }}
              ratio={aspect}
              className='h-full w-full'
            >
              <Image
                src={src}
                alt={alt}
                fill
                className='rounded object-cover'
                unoptimized
              />
            </AspectRatio>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className='h-full w-full object-cover'
              unoptimized
            />
          )
        ) : (
          <div className='flex h-full w-full items-center justify-center opacity-50'>
            <AiOutlineFileImage className='h-12 w-12' />
          </div>
        )}

        {src && showHoverIcon && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100'>
            <HoverIcon className='h-7 w-7 text-white' />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              setScale(1);
              setIsOpen(false);
              e.stopPropagation();
            }}
          >
            <motion.div
              ref={previewRef}
              className={cn(
                'relative cursor-zoom-in rounded',
                previewClassName
              )}
              style={{
                width: previewSize * previewAspect,
                height: previewSize
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
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
                      'rounded object-cover transition-transform duration-100',
                      imagePreviewClassName
                    )}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'center center'
                    }}
                    unoptimized
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
