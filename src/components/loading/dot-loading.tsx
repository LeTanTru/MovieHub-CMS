import { cn } from '@/lib';

export default function DotLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-2 bg-white dark:invert',
        className
      )}
    >
      <span className='sr-only'>Loading...</span>
      <div className='bg-dodger-blue h-2 w-2 animate-bounce rounded-full [animation-delay:-0.6s]' />
      <div className='bg-dodger-blue h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]' />
      <div className='bg-dodger-blue h-2 w-2 animate-bounce rounded-full' />
    </div>
  );
}
