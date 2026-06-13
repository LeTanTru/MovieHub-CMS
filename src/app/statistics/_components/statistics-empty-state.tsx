import { NoData } from '@/components/no-data';
import { cn } from '@/lib';

type StatisticsEmptyStateProps = {
  className?: string;
  content?: string;
};

export function StatisticsEmptyState({
  className,
  content = 'Không có dữ liệu thống kê'
}: StatisticsEmptyStateProps) {
  return (
    <NoData
      content={content}
      width={180}
      height={72}
      className={cn(
        'min-h-[360px] border border-dashed border-zinc-200 bg-white/90 text-sm text-zinc-500 shadow-sm',
        className
      )}
    />
  );
}
