'use client';

import { Button } from '@/components/form';
import { cn } from '@/lib';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  totalPages: number;
  changePagination: (page: number) => void;
  currentPage: number;
};

export default function Pagination({
  totalPages,
  changePagination,
  currentPage
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const renderPage = (page: number) => {
    const isActive = page === currentPage;
    return isActive ? (
      <span
        key={page}
        className={cn(
          'bg-background text-dodger-blue border-dodger-blue flex h-8 w-8 cursor-pointer items-center justify-center rounded border font-medium'
        )}
      >
        {page}
      </span>
    ) : (
      <Button
        variant='ghost'
        key={page}
        onClick={() => changePagination(page)}
        className={cn(
          'hover:bg-muted flex h-8 w-8 items-center justify-center rounded transition-all duration-200 ease-linear'
        )}
      >
        {page}
      </Button>
    );
  };

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    ];
  };

  const pages = getVisiblePages();

  return (
    <div className='flex w-full items-center justify-end gap-2 border-t py-4 pr-5 text-sm'>
      {currentPage > 1 ? (
        <Button
          variant='ghost'
          onClick={() => changePagination(currentPage - 1)}
          className='hover:bg-muted flex h-8 w-8 items-center justify-center rounded transition-all duration-200 ease-linear'
        >
          <ChevronLeft className='size-5!' />
        </Button>
      ) : (
        <span className='flex h-8 w-8 cursor-not-allowed items-center justify-center rounded opacity-50'>
          <ChevronLeft className='size-5!' />
        </span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`dots-${i}`}
            className='text-muted-foreground flex h-8 w-8 items-center justify-center'
          >
            …
          </span>
        ) : (
          renderPage(p as number)
        )
      )}

      {currentPage < totalPages ? (
        <Button
          variant='ghost'
          onClick={() => changePagination(currentPage + 1)}
          className='hover:bg-muted flex h-8 w-8 items-center justify-center rounded transition-all duration-200 ease-linear'
        >
          <ChevronRight className='size-5!' />
        </Button>
      ) : (
        <span className='flex h-8 w-8 cursor-not-allowed items-center justify-center rounded opacity-50'>
          <ChevronRight className='size-5!' />
        </span>
      )}
    </div>
  );
}
