import { PaginationType } from '@/types/table.type';
import { DragEndEvent } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

export type Column<T> = {
  title: string;
  dataIndex?: keyof T | string[] | 'status';
  render?: (
    value: any,
    record: T,
    index: number,
    options?: { listeners: SyntheticListenerMap | undefined }
  ) => React.ReactNode;
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
};
