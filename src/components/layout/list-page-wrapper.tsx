import { cn } from '@/lib';
import type { ReactNode } from 'react';

type ListPageWrapperProps = {
  className?: string;
  children?: ReactNode;
  searchForm?: ReactNode;
  addButton?: ReactNode;
  reloadButton?: ReactNode;
  additionButtons?: ReactNode[];
};

export function ListPageWrapper({
  className,
  children,
  searchForm,
  addButton,
  reloadButton,
  additionButtons
}: ListPageWrapperProps) {
  const hasAddtionalButtons = !!additionButtons && additionButtons.length > 0;

  const showHeader =
    !!searchForm || !!addButton || !!reloadButton || hasAddtionalButtons;

  return (
    <div
      tabIndex={-1}
      className={cn(
        'bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg',
        className
      )}
    >
      {showHeader && (
        <div className='bg-list-page-wrapper flex items-start justify-between rounded-tl-lg rounded-tr-lg p-4'>
          {!!searchForm && <div className='flex-1'>{searchForm}</div>}
          <div
            className={cn('flex gap-2', {
              'ml-auto': !searchForm,
              'ml-2': !!searchForm
            })}
          >
            {hasAddtionalButtons &&
              additionButtons?.reduce<React.ReactNode[]>(
                (acc, button, index) => {
                  if (button) {
                    acc.push(<div key={index}>{button}</div>);
                  }
                  return acc;
                },
                []
              )}
            {reloadButton}
            {addButton}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
