'use client';

import { Button } from '@/components/form';

export default function SkipIntroButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      onClick={onClick}
      className='absolute -top-15 right-5 border border-white'
      variant={'outline'}
    >
      Bỏ qua giới thiệu
    </Button>
  );
}
