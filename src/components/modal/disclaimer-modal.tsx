'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib';

const DISCLAIMER_STORAGE_KEY = 'moviehub_disclaimer_accepted';

export default function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (!accepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleAccept}>
      <AlertDialogContent
        className={cn(
          'max-w-md gap-0 p-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
        )}
        overlayProps={{
          onClick: (e) => e.stopPropagation()
        }}
      >
        <AlertDialogHeader className='border-b border-gray-200 p-6 pb-4'>
          <AlertDialogTitle className='flex items-center gap-3 text-lg font-semibold text-amber-600'>
            <AlertTriangle className='size-6' />
            Thông báo quan trọng
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className='space-y-4 p-6 text-sm leading-relaxed text-gray-700'>
            <p>
              <strong>Trang web này chỉ phục vụ mục đích học tập.</strong>
            </p>
            <p>
              Website được xây dựng nhằm mục đích nghiên cứu, học tập và phát
              triển k� năng lập trình, không sử dụng cho mục đích thương mại.
            </p>
            <p>
              Chúng tôi không khai thác kinh doanh, không thu phí và không chịu
              trách nhiệm về nội dung bên thứ ba.
            </p>
            <div className='rounded-lg bg-amber-50 p-4 text-amber-800'>
              <p className='font-medium'>⚠️ Lưu ý:</p>
              <p className='mt-1'>
                Hiện nay, cơ quan chức năng Việt Nam đang tăng cường xử lý các
                trang web vi phạm bản quyền phim ảnh. Trang web này hoạt động
                với tinh thần tôn trọng bản quyền và chỉ phục vụ mục đích học
                tập.
              </p>
            </div>
          </div>
        </AlertDialogDescription>

        <div className='border-t border-gray-200 p-4 pt-3'>
          <AlertDialogAction
            onClick={handleAccept}
            className='bg-main-color hover:bg-main-color/90 w-full cursor-pointer rounded-md px-4 py-2.5 font-medium text-white transition-colors'
          >
            Tôi đã hiểu
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
