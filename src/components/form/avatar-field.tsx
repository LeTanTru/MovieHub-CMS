'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

type AvatarFieldProps = {
  size?: number;
  icon?: React.ReactNode;
  src?: string;
  className?: string;
  previewClassName?: string;
  imagePreviewClassName?: string;
  disablePreview?: boolean;
  zoomSize?: number;
  autosize?: boolean;
  width?: number;
  height?: number;
  aspect?: number;
} & React.HTMLAttributes<HTMLElement>;

export default function AvatarField({
  size = 80,
  zoomSize = 400,
  icon,
  src,
  className,
  previewClassName,
  imagePreviewClassName,
  disablePreview = false,
  autosize = false,
  width,
  height,
  aspect = 1,
  ...props
}: AvatarFieldProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!disablePreview && src) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        {...props}
        className={cn(
          'relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border shadow-sm',
          className
        )}
        style={{ width: size * aspect, height: size }}
      >
        {src ? (
          <AspectRatio ratio={aspect} className='h-full w-full'>
            {autosize ? (
              <Image src={src} alt='Avatar' fill className='object-cover' />
            ) : (
              <Image
                src={src}
                alt='Avatar'
                width={size * aspect}
                height={size}
                className='h-full w-full object-cover'
              />
            )}
          </AspectRatio>
        ) : (
          icon || <ImageIcon className='h-1/2 w-1/2 opacity-40' />
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className={cn(
                'relative overflow-hidden rounded select-none',
                previewClassName
              )}
              style={{ width: width, height: height }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {src &&
                (autosize ? (
                  <Image
                    src={src}
                    alt='Avatar preview'
                    fill
                    className={cn(
                      'rounded object-cover',
                      imagePreviewClassName
                    )}
                    unoptimized
                  />
                ) : (
                  <Image
                    src={src}
                    alt='Avatar preview'
                    width={zoomSize}
                    height={zoomSize}
                    unoptimized
                    className={cn('rounded object-cover', previewClassName)}
                  />
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
