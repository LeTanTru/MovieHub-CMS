import { cn } from '@/lib';
import type { ReactNode } from 'react';

type ListPageWrapperProps = {
  className?: string;
  children?: ReactNode;
  searchForm?: ReactNode;
  addButton?: ReactNode;
  reloadButton?: ReactNode;
};

export default function ListPageWrapper({
  className,
  children,
  searchForm,
  addButton,
  reloadButton
}: ListPageWrapperProps) {
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
        {!!searchForm && <div className='flex-1'>{searchForm}</div>}
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
