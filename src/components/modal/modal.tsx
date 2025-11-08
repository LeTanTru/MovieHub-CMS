'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib';
import { createPortal } from 'react-dom';
import { useIsMounted } from '@/hooks';

export interface ModalProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  backdrop?: boolean;
  closeOnBackdropClick?: boolean;
  variants?: {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit: Record<string, any>;
  };
}

export default function Modal({
  children,
  open,
  onClose,
  backdrop = true,
  closeOnBackdropClick = false,
  className,
  variants = {
    initial: {
      y: -100,
      opacity: 0,
      scale: 0.95
    },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -100, opacity: 0, scale: 0.95 }
  },
  ...rest
}: ModalProps) {
  const isMounted = useIsMounted();
  if (!isMounted) return;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'fixed inset-0 top-0 z-20 flex items-center justify-center',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...rest}
        >
          {backdrop && (
            <motion.div
              className='backdrop absolute inset-0 bg-black/50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnBackdropClick ? onClose : undefined}
            />
          )}

          <motion.div
            className='content relative rounded-lg bg-white shadow-[0px_0px_10px_2px] shadow-black/40'
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.15, ease: 'linear' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
