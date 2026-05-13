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

    const hasVerticalScroll =
      document.documentElement.scrollHeight > window.innerHeight;

    document.body.classList.add('body-lock');
    Object.assign(document.body.style, {
      overflow: 'hidden',
      marginRight: hasVerticalScroll ? '15px' : ''
    });

    if (hasVerticalScroll) {
      const header = document.querySelector('.header');
      if (header && getComputedStyle(header).position === 'fixed') {
        header.setAttribute('style', 'padding-right: 15px');
      }
    }

    return () => {
      document.body.classList.remove('body-lock');
      Object.assign(document.body.style, {
        overflow: '',
        marginRight: ''
      });
      const header = document.querySelector('.header');
      if (header && getComputedStyle(header).position === 'fixed') {
        (header as HTMLElement).style.paddingRight = '';
      }
    };
  }, [open]);

  // Reset confirmation dialog when modal closes
  useEffect(() => {
    if (!open) setShowConfirm(false);
  }, [open]);

  const handleClose = () => {
    if (confirmOnClose) {
      setShowConfirm(true);
    } else {
      onClose?.();
    }
  };

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
          <m.div
            className='backdrop fixed inset-0 z-50 bg-black/50 backdrop-blur-xs'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
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
              className='fixed inset-0 z-50 overflow-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: 'linear' }}
              onClick={handleClose}
            >
              <m.div
                className={cn(
                  'relative top-25 mx-auto w-175 rounded-lg bg-white shadow-black/40',
                  className
                )}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.15, ease: 'linear' }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
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
        'header-title flex items-center justify-between border-b border-solid border-gray-200 py-2 pr-2 pl-4',
        className
      )}
    >
      {children}

      <Button
        className='h-fit! p-0! text-gray-500 transition hover:bg-transparent hover:text-rose-500'
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
    scrollElement?.addEventListener('scroll', checkOverflow, { passive: true });
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
    <div ref={ref} className='body relative flex min-h-0 flex-1 flex-col'>
      <div
        ref={scrollRef}
        className={cn(
          'scrollbar-none flex-1 rounded-br-lg rounded-bl-lg',
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className='absolute bottom-4 left-1/2 z-999 -translate-x-1/2 rounded-full p-2 text-white shadow-[0px_0px_10px_2px] shadow-gray-300'
            aria-label='Scroll down'
          >
            <ChevronDown className='size-5 text-slate-800' />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Confirm({ message, className }: ConfirmProps) {
  const { showConfirm, onConfirmYes, onConfirmNo } = useModal();
  return createPortal(
    <AnimatePresence>
      {showConfirm && (
        <m.div
          className='fixed inset-0 z-9999 flex items-center justify-center rounded-lg bg-black/40'
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
                className='border-rose-500 text-rose-500 transition-all duration-200 ease-linear hover:border-rose-500/80 hover:bg-transparent hover:text-rose-500/80'
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
    </AnimatePresence>,
    document.body
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Confirm = Confirm;
