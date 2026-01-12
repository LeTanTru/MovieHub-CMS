'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib';
import { createPortal } from 'react-dom';
import { useIsMounted } from '@/hooks';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/form';
import { Activity } from '@/components/activity';

export type ModalProps = Omit<HTMLMotionProps<'div'>, 'title'> & {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  backdrop?: boolean;
  closeOnBackdropClick?: boolean;
  title?: string | ReactNode;
  showClose?: boolean;
  width?: number;
  variants?: {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit: Record<string, any>;
  };
};

export default function Modal({
  children,
  open,
  onClose,
  backdrop = true,
  closeOnBackdropClick = false,
  className,
  title,
  showClose = true,
  variants = {
    initial: {
      y: -100,
      opacity: 0,
      scale: 0.95
    },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -100, opacity: 0, scale: 0.95 }
  },
  width,
  ...rest
}: ModalProps) {
  const isMounted = useIsMounted();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
        const hasOverflow = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
        setShowScrollArrow(hasOverflow && !isAtBottom);
      }
    };

    checkOverflow();
    const scrollElement = scrollRef.current;
    scrollElement?.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);

    return () => {
      scrollElement?.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [open, children]);

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  if (!isMounted) return;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Activity visible={backdrop}>
            <motion.div
              className='fixed inset-0 z-20 bg-black/50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnBackdropClick ? onClose : undefined}
            />
          </Activity>

          <motion.div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'fixed inset-0 z-20 flex items-center justify-center overflow-auto p-4',
              className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...rest}
          >
            <motion.div
              className='content scrollbar-none relative flex max-h-[80vh] w-full flex-col rounded-lg bg-white shadow-[0px_0px_10px_5px] shadow-black/20'
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{ duration: 0.15, ease: 'linear' }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: width ?? 'auto' }}
            >
              <Activity visible={!!title || !!showClose}>
                <div className='flex shrink-0 items-center justify-between border-b border-gray-200 pr-2 pl-4'>
                  <div className='text-base font-semibold text-gray-800'>
                    {title}
                  </div>

                  <Activity visible={showClose}>
                    <Button
                      className='p-0! text-gray-500 transition hover:text-black'
                      onClick={onClose}
                      variant={'ghost'}
                    >
                      <X className='size-5' />
                    </Button>
                  </Activity>
                </div>
              </Activity>

              <div
                ref={scrollRef}
                className='scrollbar-none relative flex-1 overflow-auto rounded-lg'
              >
                {children}

                <AnimatePresence>
                  {' '}
                  {showScrollArrow && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
                      onClick={handleScrollDown}
                      className='absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-white p-2 shadow-[0px_0px_10px_2px] shadow-gray-300 transition hover:bg-gray-50'
                      aria-label='Scroll down'
                    >
                      {' '}
                      <ChevronDown className='size-5 text-slate-800' />{' '}
                    </motion.button>
                  )}{' '}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
