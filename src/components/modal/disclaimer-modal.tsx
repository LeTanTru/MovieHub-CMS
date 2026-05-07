'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/form';
import { useEffect } from 'react';
import { storageKeys } from '@/constants';
import { useDisclosure } from '@/hooks';
import { getData, removeData, setData } from '@/utils';

const DISCLAIMER_TEXT = {
  title: 'Cảnh báo quan trọng',
  description:
    'Trang web này chỉ được sử dụng cho mục đích học tập và phát triển kỹ năng lập trình web. Tất cả nội dung phim trên website này được thu thập từ các nguồn công khai và không nhằm mục đích thương mại.',
  warning:
    'Theo quy định của pháp luật Việt Nam, việc sử dụng và phân phối nội dung vi phạm bản quyền có thể bị xử lý hình sự và dân sự. Để tránh rủi ro pháp lý, hãy sử dụng các nền tảng phát trực tuyến có giấy phép hợp lệ như Netflix, Disney+, VietFilm,...',
  agree: 'Tôi đã hiểu và đồng ý'
};

export default function DisclaimerModal() {
  const { opened, close } = useDisclosure(
    getData(storageKeys.DISCLAIMER_SHOWN) !== 'true'
  );

  const handleAgree = () => {
    setData(storageKeys.DISCLAIMER_SHOWN, 'true');
    close();
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      removeData(storageKeys.DISCLAIMER_SHOWN);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className='max-w-md border-none'
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='flex flex-col items-center gap-3 text-center'>
          <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-rose-500/10'>
            <AlertTriangle className='size-7 text-rose-500' />
          </div>
          <DialogTitle className='text-xl'>{DISCLAIMER_TEXT.title}</DialogTitle>
          <DialogDescription className='text-justify text-base'>
            {DISCLAIMER_TEXT.description}
          </DialogDescription>
        </DialogHeader>

        <div className='rounded-lg bg-rose-500/10 p-4'>
          <p className='text-justify text-sm text-rose-600'>
            {DISCLAIMER_TEXT.warning}
          </p>
        </div>

        <div className='flex flex-col gap-3'>
          <Button
            variant='primary'
            onClick={handleAgree}
            className='w-full cursor-pointer transition-all duration-200 ease-linear'
          >
            {DISCLAIMER_TEXT.agree}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
