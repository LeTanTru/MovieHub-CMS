import { cn } from '@/lib';
import Image from 'next/image';

type NotFoundProps = {
  title: string;
  icon: string;
  width?: number;
  height?: number;
  className?: string;
};

export function NotFound({
  title,
  icon,
  width = 200,
  height = 200,
  className
}: NotFoundProps) {
  return (
    <div
      className={cn(
        'mx-2 flex h-[calc(90dvh-6rem)] w-full flex-col items-center justify-center rounded-lg bg-white max-[1560px]:h-[calc(90dvh-115px)]',
        className
      )}
    >
      <Image src={icon} alt={title} width={width} height={height} />
      <span className='mt-4 text-center font-medium'>{title}</span>
    </div>
  );
}
