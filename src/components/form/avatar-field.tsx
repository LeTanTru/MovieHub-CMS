'use client';

import { cn } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AiOutlineUser } from 'react-icons/ai';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

type AvatarFieldProps = {
  size?: number;
  icon?: ReactNode;
  src?: string;
  className?: string;
  previewClassName?: string;
  imagePreviewClassName?: string;
  disablePreview?: boolean;
  previewSize?: number;
  width?: number;
  height?: number;
  aspect?: number;
  previewAspect?: number;
  alt?: string;
  zoomOnScroll?: boolean;
  showHoverIcon?: boolean;
} & HTMLAttributes<HTMLElement>;

export default function AvatarField({
  size = 48,
  previewSize = 200,
  icon,
  src,
  className,
  previewClassName,
  imagePreviewClassName,
  disablePreview = false,
  width,
  height,
  aspect = 1,
  previewAspect = 1,
  showHoverIcon = true,
  zoomOnScroll = true,
  alt,
  ...props
}: AvatarFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    if (disablePreview || !src) return;
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!zoomOnScroll) return;

      e.preventDefault();

      setScale((prev) => {
        let next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
        next = Math.max(1, Math.min(3, next));
        return next;
      });
    },
    [zoomOnScroll]
  );

  useEffect(() => {
    if (!isModalOpen || !previewRef.current) return;

    const node = previewRef.current;
    node.addEventListener('wheel', handleWheel, { passive: false });

    return () => node.removeEventListener('wheel', handleWheel);
  }, [handleWheel, isModalOpen]);

  return (
    <>
      <div
        {...props}
        onClick={props?.onClick ?? handleClick}
        className={cn(
          'relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-sm',
          className
        )}
        style={{ width: width || size, height: height || size }}
      >
        {src ? (
          <AspectRatio ratio={aspect} className='h-full w-full'>
            {aspect ? (
              <Image
                src={src}
                alt={alt ?? 'Avatar'}
                fill
                className='object-cover'
                unoptimized
              />
            ) : (
              <Image
                src={src}
                alt={alt ?? 'Avatar'}
                width={width}
                height={height}
                className='h-full w-full object-cover'
                unoptimized
              />
            )}
          </AspectRatio>
        ) : (
          icon || <AiOutlineUser className='h-1/2 w-1/2 opacity-40' />
        )}
        {src && showHoverIcon && !disablePreview && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-all duration-200 ease-linear hover:opacity-100'>
            <EyeIcon className='h-6 w-6 text-white' />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setScale(1);
              setIsModalOpen(false);
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
