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
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Pagination } from '@/components/pagination';
import { Activity } from '@/components/activity';

function getValueByPath<T extends Record<string, any>>(
  obj: T,
  path?: string | string[] | keyof T
): any {
  if (!obj || !path) return undefined;

  if (typeof path === 'string') {
    return obj[path];
  }

  if (Array.isArray(path)) {
    return path.reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return acc[key];
      }
      return undefined;
    }, obj as any);
  }

  return obj[path as keyof T];
}

export default function BaseTable<T extends Record<any, any>>({
  columns,
  dataSource,
  rowKey = 'id',
  pagination,
  changePagination,
  loading
}: BaseTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const { total } = pagination;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const div = scrollRef.current?.querySelector('div');
      const maxScrollLeft = (div?.scrollWidth ?? 0) - (div?.clientWidth ?? 0);
      setScrollAtEnd((div?.scrollLeft ?? 0) >= maxScrollLeft);
    };

    el.querySelector('div')?.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className='bg-base-table flex flex-col gap-y-5 rounded-br-lg rounded-bl-lg text-sm'>
      <div className='base-table relative flex-1'>
        <div
          className='scroll-wrapper bg-base-table w-full [&>div]:overflow-y-hidden'
          ref={scrollRef}
        >
          <Table className='w-full min-w-200'>
            <TableHeader className='bg-gray-50'>
              <TableRow className='border-b-[0.2px]'>
                {columns.map((col, idx) => {
                  const isLast = idx === columns.length - (col.fixed ? 2 : 1);
                  return (
                    <TableHead
                      key={idx}
                      className={cn(
                        `relative bg-zinc-50 px-4 py-4 text-sm! leading-5.5 text-black ${
                          col.align ? `text-${col.align}` : 'text-left'
                        }`,
                        {
                          'before:absolute before:top-1/2 before:right-0 before:h-1/2 before:w-0.5 before:-translate-y-1/2 before:bg-zinc-100':
                            !isLast && !col.fixed,
                          'sticky right-0 z-1 z-10 bg-white transition-all duration-300':
                            col.fixed,
                          'before:absolute before:top-0 before:bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
                            col.fixed && !scrollAtEnd
                        }
                      )}
                      style={{ width: col.width }}
                    >
                      {col.title}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className='[&_tr:last-child]:border-b-none'>
              {dataSource.length > 0 ? (
                <>
                  {dataSource.map((row, rowIndex) => (
                    <TableRow
                      key={String(row[rowKey])}
                      className='border-b-[0.2px] hover:bg-zinc-50'
                    >
                      {columns.map((col, colIndex) => {
                        return (
                          <TableCell
                            key={colIndex}
                            className={cn(
                              `relative h-[65px] px-4 leading-8 ${
                                col.align ? `text-${col.align}` : 'text-left'
                              }`,
                              {
                                'sticky right-0 z-1 z-10 bg-white transition-all duration-300':
                                  col.fixed,
                                'before:absolute before:top-0 before:-bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
                                  col.fixed && !scrollAtEnd
                              }
                            )}
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
                                ? getValueByPath(row, col.dataIndex)
                                : null}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  {/* {!(!total || total <= 1) && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell
                        colSpan={columns.length}
                        className='py-4 text-right'
                      >
                        <Pagination
                          changePagination={changePagination}
                          currentPage={pagination.current}
                          totalPages={total}
                        />
                      </TableCell>
                    </TableRow>
                  )} */}
                </>
              ) : (
                <Activity visible={dataSource.length === 0 && !loading}>
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
                        />
                        <span>Không có dữ liệu</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </Activity>
              )}
            </TableBody>
          </Table>
        </div>
        <Activity visible={!(!total || total <= 1)}>
          <div className='flex justify-end'>
            <Pagination
              changePagination={changePagination}
              currentPage={pagination.current}
              totalPages={total}
            />
          </div>
        </Activity>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              className='absolute inset-0 top-[55px] z-50 flex items-start justify-center bg-white/70 pt-5'
            >
              <CircleLoading className='stroke-dodger-blue size-8' />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
