import { Activity } from '@/components/activity';
import { cn } from '@/lib';
import type { ReactNode } from 'react';

export default function ListPageWrapper({
  className,
  children,
  searchForm,
  addButton,
  reloadButton
}: {
  className?: string;
  children?: ReactNode;
  searchForm?: ReactNode;
  addButton?: ReactNode;
  reloadButton?: ReactNode;
}) {
  return (
    <div
      tabIndex={-1}
      className={cn(
        'bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg',
        className
      )}
    >
      <div
        className={cn(
          'bg-list-page-wrapper flex items-start justify-between rounded-tl-lg rounded-tr-lg p-4',
          {
            'py-0': !(searchForm || addButton || reloadButton)
          }
        )}
      >
        <Activity visible={!!searchForm}>
          <div className='flex-1'>{searchForm}</div>
        </Activity>
        <div
          className={cn('flex gap-2', {
            'ml-auto': !searchForm,
            'ml-2': !!searchForm
          })}
        >
          {reloadButton}
          {addButton}
        </div>
      </div>
      {children}
    </div>
  );
}
