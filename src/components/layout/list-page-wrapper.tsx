import { cn } from '@/lib';

export default function ListPageWrapper({
  className,
  children,
  searchForm,
  addButton,
  reloadButton
}: {
  className?: string;
  children?: React.ReactNode;
  searchForm?: React.ReactNode;
  addButton?: React.ReactNode;
  reloadButton?: React.ReactNode;
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
        {searchForm && <div className='flex-1'>{searchForm}</div>}
        <div
          className={cn('flex gap-2', {
            'ml-auto': !searchForm
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
