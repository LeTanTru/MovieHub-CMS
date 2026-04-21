'use client';

import { Button } from '@/components/form';

type SkipOutroButtonProps = {
  onClick?: () => void;
};

export default function SkipOutroButton({ onClick }: SkipOutroButtonProps) {
  return (
    <Button
      type='button'
      onClick={onClick}
      variant='outline'
      className='absolute -top-15 right-5 border border-white hover:border-white/80'
      aria-label='Jump to the next episode'
      aria-keyshortcuts='N'
    >
      Tập tiếp theo
    </Button>
  );
}
