'use client';

import {
  ReactNode,
  useRef,
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';
import { AnimatePresence, m, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib';
import { createPortal } from 'react-dom';
import { useIsMounted } from '@/hooks';
import { X, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/form';
import { isMobileDevice } from '@/utils';

type ModalContextType = {
  open: boolean;
  onClose: () => void;
  showConfirm: boolean;
  onConfirmYes: () => void;
  onConfirmNo: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};

type ModalProps = Omit<HTMLMotionProps<'div'>, 'title'> & {
  open: boolean;
  onClose: () => void;
  backdrop?: boolean;
  confirmOnClose?: boolean;
  variants?: {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit: Record<string, any>;
  };
};

type HeaderProps = {
  children: ReactNode;
  className?: string;
};

type BodyProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
};

type ConfirmProps = {
  message: string;
  className?: string;
};

export default function Modal({
  children,
  open,
  onClose,
  backdrop = true,
  className,
  confirmOnClose = false,
  variants = {
    initial: { opacity: 0.5, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0.5, scale: 0.85 }
  },
  ...rest
}: ModalProps) {
  const isMounted = useIsMounted();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isMobileDevice()) document.body.classList.add('body-lock', 'mobile');
    else document.body.classList.add('body-lock');
    return () => {
      document.body.classList.remove('body-lock');
      document.body.classList.remove('body-lock', 'mobile');
    };
  }, [open]);

  // Reset confirmation dialog when modal closes
  useEffect(() => {
    if (!open) setShowConfirm(false);
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (!open) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (confirmOnClose) {
      setShowConfirm(true);
    } else {
      onClose?.();
    }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    onClose?.();
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {backdrop && (
            <m.div
              className='backdrop fixed inset-0 z-20 bg-black/50 backdrop-blur-xs'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          )}
          <ModalContext.Provider
            value={{
              open,
              onClose: handleClose,
              showConfirm,
              onConfirmYes: handleConfirmYes,
              onConfirmNo: handleConfirmNo
            }}
          >
            <m.div
              className='fixed inset-0 z-20 flex items-center justify-center overflow-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: 'linear' }}
              onClick={handleClose}
            >
              <m.div
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-[0px_0px_10px_2px] shadow-black/40',
                  className
                )}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.15, ease: 'linear' }}
                {...rest}
              >
                {children}
              </m.div>
            </m.div>
          </ModalContext.Provider>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Header({ children, className }: HeaderProps) {
  const { onClose } = useModal();

  return (
    <div
      className={cn(
        'header-title flex h-10 items-center justify-between border-b border-none border-solid border-gray-200 py-2 pr-2 pl-4',
        className
      )}
    >
      {children}

      <Button
        className='h-fit! p-0! text-gray-500 transition hover:bg-transparent hover:text-black'
        onClick={onClose}
        variant='ghost'
      >
        <X className='size-5' />
      </Button>
    </div>
  );
}

function Body({ children, className, ref, scrollable }: BodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    if (!scrollable) return;

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
  }, [scrollable]);

  const handleScrollDown = () => {
    scrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' });
  };

  return (
    <div ref={ref} className='body relative h-[calc(100%-40px)]'>
      <div
        ref={scrollRef}
        className={cn(
          'scrollbar-none h-full rounded-br-lg rounded-bl-lg',
          { 'overflow-auto': scrollable },
          className
        )}
      >
        {children}
      </div>

      <AnimatePresence>
        {scrollable && showScrollArrow && (
          <m.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleScrollDown}
            className='absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce rounded-full p-2 text-white shadow-[0px_0px_10px_2px] shadow-gray-300 transition-all'
            aria-label='Scroll down'
          >
            <ChevronDown className='size-5 text-slate-800' />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Confirm = Confirm;

function Confirm({ message, className }: ConfirmProps) {
  const { showConfirm, onConfirmYes, onConfirmNo } = useModal();
  return (
    <AnimatePresence>
      {showConfirm && (
        <m.div
          className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/40'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'linear' }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <m.div
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-lg',
              className
            )}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            <div className='flex items-center'>
              <Info className='size-6 fill-orange-500 stroke-white' />
              <p className='ml-1 text-center font-medium text-gray-700'>
                {message}
              </p>
            </div>
            <div className='flex w-full justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='border-red-500 text-red-500 transition-all duration-200 ease-linear hover:border-red-500/80 hover:bg-transparent hover:text-red-500/80'
                onClick={onConfirmNo}
              >
                Không
              </Button>
              <Button
                size='sm'
                className='bg-main-color hover:bg-main-color/80 text-white'
                onClick={onConfirmYes}
              >
                Có
              </Button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
