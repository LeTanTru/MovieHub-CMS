import { logger } from '@/logger';
import type { ApiConfig, ApiResponseNoData, Column } from '@/types';
import { http, invalidateQueries, notify } from '@/utils';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

const sortColumn: Column<unknown> = {
  title: '#',
  key: 'sort',
  width: 50,
  align: 'center'
};

type UseDragDropType<T extends { id: string }> = {
  key: string;
  objectName: string;
  data: T[];
  apiConfig: ApiConfig;
  sortField?: keyof T;
  updateOnDragEnd?: boolean;
  mappingData?: (record: T, index: number) => Record<string, unknown>;
};

/**
 * Hook to manage drag and drop ordering updates for lists.
 *
 * @param params - The drag and drop configuration and state parameters.
 * @param params.key - The query key used for query invalidation after updates.
 * @param params.objectName - The descriptive name of the entity being ordered.
 * @param params.data - The raw list data before sorting.
 * @param params.apiConfig - The API endpoint configuration to update the ordering.
 * @param params.sortField - The field name by which list items are ordered (defaults to 'ordering').
 * @param params.updateOnDragEnd - Automatically call the update API when drag ends.
 * @param params.mappingData - Optional callback to map item attributes for the API payload.
 */
export const useDragDrop = <T extends { id: string }>({
  key,
  objectName,
  data,
  apiConfig,
  sortField = 'ordering' as keyof T,
  updateOnDragEnd,
  mappingData
}: UseDragDropType<T>) => {
  const sortData = useCallback(
    (items: T[]) =>
      items.toSorted(
        (a, b) => (a?.[sortField] as number) - (b?.[sortField] as number)
      ),
    [sortField]
  );

  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [sortedData, setSortedData] = useState<T[]>(() => sortData(data));

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateOrdering', apiConfig.baseUrl],
    mutationFn: (body: Record<string, unknown>[]) =>
      http.put<ApiResponseNoData>(apiConfig, {
        body
      })
  });

  const handleUpdate = useCallback(
    async (dataOverride?: T[]) => {
      const finalData = dataOverride || sortedData;

      const dataUpdate: Record<string, unknown>[] = [];

      finalData.forEach((item, index) => {
        let baseData: Record<string, unknown> = {
          id: item.id,
          [sortField as string]: index
        };

        if (typeof mappingData === 'function') {
          baseData = { ...baseData, ...mappingData(item, index) };
        }

        dataUpdate.push(baseData);
      });

      await mutateAsync(dataUpdate, {
        onSuccess: () => {
          invalidateQueries([key]);
          setIsChanged(false);

          notify.success(`Cập nhật thứ tự ${objectName} thành công`);
        },
        onError: (error) => {
          logger.error('[UPDATE_ORDERING_ERROR]', error);
          notify.error(`Cập nhật thứ tự ${objectName} thất bại`);

          setIsChanged(false);
        }
      });
    },
    [key, mappingData, mutateAsync, objectName, sortField, sortedData]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active || !over || active.id === over.id) return;

      const currentData = sortedData;

      const activeIndex = currentData.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = currentData.findIndex((item) => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const newData = arrayMove(currentData, activeIndex, overIndex);
      setSortedData(newData);
      setIsChanged(true);

      if (updateOnDragEnd) {
        await handleUpdate(newData);
      }
    },
    [handleUpdate, sortedData, updateOnDragEnd]
  );

  useEffect(() => {
    if (data) setSortedData(sortData(data));
    else setSortedData([]);
  }, [data, sortData]);

  return {
    isChanged,
    sortColumn: sortColumn as Column<T>,
    sortedData,
    loading: isPending,
    setIsChanged,
    onDragEnd,
    handleUpdate
  };
};
