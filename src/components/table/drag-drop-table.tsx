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
import { CSS } from '@dnd-kit/utilities';
import { Grip } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleLoading } from '@/components/loading';
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

function SortableRow<T extends Record<any, any>>({
  row,
  rowIndex,
  columns,
  rowKey,
  onSelect,
  rowClassName,
  rowStyle
}: {
  row: T;
  rowIndex: number;
  columns: BaseTableProps<T>['columns'];
  rowKey: string;
  onSelect?: () => void;
  rowClassName?: (row: T, index: number) => string;
  rowStyle?: (row: T, index: number) => CSSProperties;
}) {
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
        'border-b-[0.2px] hover:bg-zinc-50',
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
          className={`h-[65px] px-4 leading-8 ${
            col.align ? `text-${col.align}` : 'text-left'
          }`}
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

export default function DragDropTable<T extends Record<any, any>>({
  columns,
  dataSource,
  rowKey = 'id',
  loading,
  onDragEnd,
  onSelectRow,
  rowClassName,
  rowStyle
}: DragDropTableProps<T>) {
  const [rows, setRows] = useState(() => dataSource || []);
  const tableRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5
      }
    })
  );

  useEffect(() => {
    if (JSON.stringify(dataSource) !== JSON.stringify(rows)) {
      setRows(dataSource || []);
    }
  }, [dataSource, rows]);

  return (
    <div className='mr-2 flex flex-col gap-y-5 rounded-br-lg rounded-bl-lg bg-white text-sm'>
      <div
        className='base-table relative flex-1 overflow-hidden'
        ref={tableRef}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={onDragEnd}
        >
          <Table className='w-full table-fixed overflow-hidden'>
            <TableHeader className='bg-gray-50'>
              <TableRow className='border-b-[0.2px]'>
                {columns.map((col, idx) => {
                  const isLast = idx === columns.length - 1;
                  return (
                    <TableHead
                      key={idx}
                      className={cn(
                        `relative bg-zinc-50 px-4 py-4 text-sm! leading-5.5 text-black ${
                          col.align ? `text-${col.align}` : 'text-left'
                        }`,
                        {
                          'before:absolute before:top-1/2 before:right-0 before:h-1/2 before:w-0.5 before:-translate-y-1/2 before:bg-zinc-100':
                            !isLast
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
            <TableBody className='[&_tr:last-child]:border-b'>
              {rows.length > 0 ? (
                <>
                  <SortableContext
                    items={rows.map((r) => r[rowKey])}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map((row, idx) => (
                      <SortableRow
                        key={String(row[rowKey])}
                        row={row}
                        rowIndex={idx}
                        columns={columns}
                        rowKey={rowKey}
                        onSelect={() => onSelectRow?.(row)}
                        rowClassName={rowClassName}
                        rowStyle={rowStyle}
                      />
                    ))}
                  </SortableContext>
                </>
              ) : (
                <Activity visible={!dataSource.length}>
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
                        />
                        <span>Không có dữ liệu</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </Activity>
              )}
            </TableBody>
          </Table>
        </DndContext>
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
