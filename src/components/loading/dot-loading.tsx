import { cn } from '@/lib';

type DotLoadingProps = { className?: string };

export default function DotLoading({ className }: DotLoadingProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 bg-white',
        className
      )}
    >
      <div className='bg-main-color size-2 animate-bounce rounded-full [animation-delay:-0.6s]' />
      <div className='bg-main-color size-2 animate-bounce rounded-full [animation-delay:-0.3s]' />
      <div className='bg-main-color size-2 animate-bounce rounded-full' />
    </div>
  );
}
