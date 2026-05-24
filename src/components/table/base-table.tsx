'use client';

import './base-table.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { BaseTableProps } from '@/types';
import Image from 'next/image';
import { emptyData } from '@/assets';
import { cn } from '@/lib';
import { CircleLoading } from '@/components/loading';
import { m, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pagination } from '@/components/pagination';

function getValueByPath<T extends Record<string, unknown>>(
  obj: T,
  path?: string | string[] | keyof T
): unknown {
  if (!obj || !path) return undefined;

  if (typeof path === 'string') {
    return obj[path];
  }

  if (Array.isArray(path)) {
    return path.reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
  }

  return obj[path as keyof T];
}

export function BaseTable<T extends Record<string, unknown>>({
  columns,
  dataSource,
  rowKey = 'id',
  pagination,
  changePagination,
  loading,
  rowClassName
}: BaseTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const { total } = pagination;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollDiv = el.querySelector('div');
    if (!scrollDiv) return;

    const handleScroll = () => {
      const maxScrollLeft = scrollDiv.scrollWidth - scrollDiv.clientWidth;
      if (maxScrollLeft <= 0) {
        setScrollAtEnd(true);
      } else {
        setScrollAtEnd(Math.ceil(scrollDiv.scrollLeft) >= maxScrollLeft - 1);
      }
    };

    scrollDiv.addEventListener('scroll', handleScroll, {
      passive: true
    });

    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });

    resizeObserver.observe(scrollDiv);
    const table = el.querySelector('table');
    if (table) resizeObserver.observe(table);

    handleScroll();

    return () => {
      scrollDiv.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className='bg-base-table flex flex-col gap-y-5 rounded-br-lg rounded-bl-lg'>
      <div className='base-table relative flex-1'>
        <div
          className='scroll-wrapper bg-base-table w-full [&>div]:overflow-y-hidden'
          ref={scrollRef}
        >
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow className='border-b-[0.2px] border-b-gray-100'>
                {columns.map((col, idx) => {
                  const isLast = idx === columns.length - (col.fixed ? 2 : 1);
                  return (
                    <TableHead
                      key={idx}
                      className={cn(
                        'relative bg-zinc-50 px-4 py-2 whitespace-nowrap text-black',
                        {
                          [`text-${col.align || 'left'}`]: true,
                          'before:absolute before:top-1/2 before:right-0 before:h-1/2 before:w-0.5 before:-translate-y-1/2 before:bg-zinc-100':
                            !isLast && !col.fixed,
                          'sticky right-0 z-1 z-10 bg-white transition-all duration-300':
                            col.fixed,
                          'before:absolute before:top-0 before:bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
                            col.fixed && !scrollAtEnd
                        }
                      )}
                      style={{
                        width: col.width,
                        minWidth: col.width
                      }}
                    >
                      {col.title}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className='[&_tr:last-child]:border-b-none'>
              {dataSource.length > 0
                ? dataSource.map((row, rowIndex) => (
                    <TableRow
                      key={String(row[rowKey])}
                      className={cn(
                        'border-b-[0.2px] transition-colors duration-200 ease-linear hover:bg-zinc-50',
                        rowClassName?.(row, rowIndex)
                      )}
                    >
                      {columns.map((col, colIndex) => {
                        return (
                          <TableCell
                            key={colIndex}
                            className={cn(
                              'relative h-[65px] px-4 leading-8 whitespace-nowrap',
                              {
                                [`text-${col.align || 'left'}`]: true,
                                'sticky right-0 z-1 z-10 bg-white transition-all duration-300':
                                  col.fixed,
                                'before:absolute before:top-0 before:-bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
                                  col.fixed && !scrollAtEnd
                              }
                            )}
                            style={{
                              width: col.width,
                              minWidth: col.width
                            }}
                          >
                            {col.render
                              ? col.render(
                                  col.dataIndex
                                    ? getValueByPath(row, col.dataIndex)
                                    : undefined,
                                  row,
                                  rowIndex
                                )
                              : col.dataIndex
                                ? (getValueByPath(
                                    row,
                                    col.dataIndex
                                  ) as ReactNode)
                                : null}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                : dataSource.length === 0 &&
                  !loading && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell
                        colSpan={columns.length}
                        className='py-8 text-center align-middle'
                        style={{ textAlign: 'center' }}
                      >
                        <div className='flex flex-col items-center justify-center'>
                          <Image
                            src={emptyData.src}
                            alt='Không có dữ liệu'
                            width={150}
                            height={50}
                            className='h-auto'
                          />
                          <span>Không có dữ liệu</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
        {!(!total || total <= 1) && (
          <div className='flex justify-end'>
            <Pagination
              changePagination={changePagination}
              currentPage={pagination.current}
              totalPages={total}
            />
          </div>
        )}
        <AnimatePresence>
          {loading && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              className='absolute inset-0 top-[55px] z-50 flex items-start justify-center bg-white/80 pt-5'
            >
              <CircleLoading className='stroke-main-color' />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
