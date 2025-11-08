import { emptyData } from '@/assets';
import { cn } from '@/lib';
import Image from 'next/image';

export default function NoData({
  className,
  content = 'Không có dữ liệu'
}: {
  className?: string;
  content?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[80dvh] flex-col items-center justify-center gap-4 rounded-lg bg-white py-4',
        className
      )}
    >
      <Image src={emptyData.src} width={200} height={80} alt={content} />
      <p>{content}</p>
    </div>
  );
}
