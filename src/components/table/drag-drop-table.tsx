'use client';

import './base-table.css';
import './drag-drop-table.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { BaseTableProps, DragDropTableProps } from '@/types';
import Image from 'next/image';
import { emptyData } from '@/assets';
import { cn } from '@/lib';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

const EMPTY_DATA_SOURCE: unknown[] = [];
import { CSS } from '@dnd-kit/utilities';
import { Grip } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { CircleLoading } from '@/components/loading';

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

type SortableRowProps<T extends Record<any, any>> = {
  row: T;
  rowIndex: number;
  columns: BaseTableProps<T>['columns'];
  rowKey: string;
  onSelect?: () => void;
  rowClassName?: (row: T, index: number) => string;
  rowStyle?: (row: T, index: number) => CSSProperties;
  scrollAtEnd: boolean;
};

function SortableRow<T extends Record<any, any>>({
  row,
  rowIndex,
  columns,
  rowKey,
  onSelect,
  rowClassName,
  rowStyle,
  scrollAtEnd
}: SortableRowProps<T>) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef
  } = useSortable({ id: row[rowKey], animateLayoutChanges: () => false });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : undefined,
    position: isDragging ? 'relative' : undefined,
    borderRadius: isDragging ? 4 : undefined,
    boxShadow: isDragging ? '0 4px 8px 10px rgba(0, 0, 0, 0.1)' : undefined
  };

  return (
    <TableRow
      ref={setNodeRef}
      className={cn(
        'transition-colors duration-200 ease-linear not-last:border-b-[0.2px] hover:bg-zinc-50',
        rowClassName?.(row, rowIndex)
      )}
      onClick={onSelect}
      style={{
        ...style,
        ...(rowStyle?.(row, rowIndex) || {})
      }}
      {...attributes}
    >
      {columns.map((col, colIndex) => (
        <TableCell
          key={colIndex}
          className={cn('relative h-[65px] px-4 leading-8 whitespace-nowrap', {
            [`text-${col.align || 'left'}`]: true,
            'sticky right-0 z-10 bg-white transition-all duration-300':
              col.fixed,
            'before:absolute before:top-0 before:-bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
              col.fixed && !scrollAtEnd
          })}
          style={{ width: col.width, minWidth: col.width }}
        >
          {col.key === 'sort' ? (
            <button
              {...listeners}
              className='mx-auto flex cursor-move items-center justify-center'
            >
              <Grip size={16} />
            </button>
          ) : col.render ? (
            col.render(
              col.dataIndex ? getValueByPath(row, col.dataIndex) : undefined,
              row,
              rowIndex
            )
          ) : col.dataIndex ? (
            getValueByPath(row, col.dataIndex)
          ) : null}
        </TableCell>
      ))}
    </TableRow>
  );
}

export const DragDropTable = <T extends Record<any, any>>({
  columns,
  dataSource = EMPTY_DATA_SOURCE as T[],
  rowKey = 'id',
  loading,
  onDragEnd,
  onSelectRow,
  rowClassName,
  rowStyle
}: DragDropTableProps<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5
      }
    })
  );

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
    <div className='mr-2 flex flex-col gap-y-5 overflow-hidden rounded-lg bg-white text-sm'>
      <div className='base-table relative flex-1 overflow-hidden'>
        <div
          className='scroll-wrapper bg-base-table w-full overflow-x-auto [&>div]:overflow-y-hidden'
          ref={scrollRef}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={onDragEnd}
          >
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow className='border-b-gray-100 not-last:border-b-[0.2px]'>
                  {columns.map((col, idx) => {
                    const isLast = idx === columns.length - (col.fixed ? 2 : 1);
                    return (
                      <TableHead
                        key={idx}
                        className={cn(
                          'relative bg-zinc-50 px-4 py-4 text-sm! leading-5.5 whitespace-nowrap text-black',
                          {
                            [`text-${col.align || 'left'}`]: true,
                            'before:absolute before:top-1/2 before:right-0 before:h-1/2 before:w-0.5 before:-translate-y-1/2 before:bg-zinc-100':
                              !isLast && !col.fixed,
                            'sticky right-0 z-10 bg-white transition-all duration-300':
                              col.fixed,
                            'before:absolute before:top-0 before:bottom-px before:left-0 before:w-7.5 before:-translate-x-full before:shadow-[inset_-10px_0_8px_-8px] before:shadow-[rgba(5,5,5,0.1)]':
                              col.fixed && !scrollAtEnd
                          }
                        )}
                        style={{ width: col.width, minWidth: col.width }}
                      >
                        {col.title}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSource.length > 0 ? (
                  <SortableContext
                    items={dataSource.map((r) => r[rowKey])}
                    strategy={verticalListSortingStrategy}
                  >
                    {dataSource.map((row, idx) => (
                      <SortableRow
                        key={String(row[rowKey])}
                        row={row}
                        rowIndex={idx}
                        columns={columns}
                        rowKey={rowKey}
                        onSelect={() => onSelectRow?.(row)}
                        rowClassName={rowClassName}
                        rowStyle={rowStyle}
                        scrollAtEnd={scrollAtEnd}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  !dataSource.length && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell
                        colSpan={columns.length}
                        className='py-8 text-center align-middle'
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
                  )
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
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
};
