'use client';

import { Button } from '@/components/form';

type SkipIntroButtonProps = {
  onClick?: () => void;
};

export const SkipIntroButton = ({ onClick }: SkipIntroButtonProps) => {
  return (
    <Button
      type='button'
      onClick={onClick}
      variant='outline'
      className='absolute -top-15 right-5 border border-white hover:border-white/80'
      aria-label='Bỏ qua phần giới thiệu của video'
      aria-keyshortcuts='S'
    >
      Bỏ qua giới thiệu
    </Button>
  );
};
