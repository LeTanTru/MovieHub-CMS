'use client';

import { Button } from '@/components/form';

export default function SkipIntroButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      type='button'
      onClick={onClick}
      variant='outline'
      className='absolute -top-15 right-5 border border-white'
      aria-label='Bỏ qua phần giới thiệu của video'
      aria-keyshortcuts='S'
    >
      Bỏ qua giới thiệu
    </Button>
  );
}
