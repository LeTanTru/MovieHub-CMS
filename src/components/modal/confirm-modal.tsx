'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/form';
import { cn } from '@/lib';
import { Info } from 'lucide-react';
import { useState } from 'react';

type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  className?: string;
  // Controlled mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Có',
  cancelText = 'Không',
  trigger,
  className,
  open: controlledOpen,
  onOpenChange
}: ConfirmModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (v: boolean) => onOpenChange?.(v)
    : setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-top-0! top-[30%] w-fit max-w-lg gap-0 p-4',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-sm font-normal'>
            <Info className='size-6 fill-orange-500 stroke-white' />
            {message}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-2'>
          <AlertDialogCancel asChild onClick={handleCancel}>
            <Button
              variant='outline'
              className='h-8 cursor-pointer border-red-500 font-normal text-red-500 transition-all duration-200 ease-linear hover:border-red-500/80 hover:bg-transparent hover:text-red-500/80'
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className='bg-main-color hover:bg-main-color/80 h-8 cursor-pointer font-normal transition-all duration-200 ease-linear'
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
