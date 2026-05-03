import { emptyData } from '@/assets';
import { cn } from '@/lib';
import Image from 'next/image';

type NoDataProps = {
  className?: string;
  content?: string;
  width?: number;
  height?: number;
};

export default function NoData({
  className,
  content = 'Không có dữ liệu',
  width = 200,
  height = 80
}: NoDataProps) {
  return (
    <div
      className={cn(
        'flex min-h-[50dvh] flex-col items-center justify-center gap-4 rounded-lg bg-white py-4',
        className
      )}
    >
      <Image src={emptyData.src} width={width} height={height} alt={content} />
      <p>{content}</p>
    </div>
  );
}
