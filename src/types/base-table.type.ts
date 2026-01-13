import type { PaginationType } from '@/types/table.type';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { CSSProperties, ReactNode } from 'react';

export type Column<T> = {
  title: string;
  dataIndex?: keyof T | string[] | 'status';
  render?: (
    value: any,
    record: T,
    index: number,
    options?: { listeners: SyntheticListenerMap | undefined }
  ) => ReactNode;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
  fixed?: boolean;
  key?: string;
};

export type BaseTableProps<T> = {
  columns: Column<T>[];
  dataSource: T[];
  rowKey?: string;
  pagination: PaginationType;
  loading: boolean;
  changePagination: (page: number) => void;
};

export type DragDropTableProps<T extends Record<any, any>> = {
  columns: Column<T>[];
  dataSource: T[];
  rowKey?: string;
  loading: boolean;
  onDragEnd?: (event: DragEndEvent) => void;
  onSelectRow?: (record: T) => void;
  onRow?: (record: T, index: number) => void;
  rowClassName?: (record: T, index: number) => string;
  rowStyle?: (record: T, index: number) => CSSProperties;
};
