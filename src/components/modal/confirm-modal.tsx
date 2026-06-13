'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/form/button';
import { cn } from '@/lib';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { CircleLoading } from '@/components/loading';

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
  loading?: boolean;
};

export function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Có',
  cancelText = 'Không',
  trigger,
  className,
  open: controlledOpen,
  onOpenChange,
  loading
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
        overlayProps={{ onClick: (e) => e.stopPropagation() }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-sm font-normal'>
            <Info className='size-6 fill-orange-500 stroke-white' />
            {message}
          </AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-2'>
          <AlertDialogCancel asChild onClick={handleCancel}>
            <Button
              variant='outline'
              className='h-8 cursor-pointer border-rose-500 font-normal text-rose-500 transition-all duration-200 ease-linear hover:border-rose-500/80 hover:bg-transparent hover:text-rose-500/80 focus-visible:border-rose-500 focus-visible:ring-0 focus-visible:ring-rose-500'
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className='bg-sporty-blue hover:bg-sporty-blue/80 focus-visible:ring-sporty-blue h-8 cursor-pointer font-normal transition-all duration-200 ease-linear focus-visible:ring-0'
          >
            {loading ? (
              <CircleLoading className='size-4 stroke-white' />
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
