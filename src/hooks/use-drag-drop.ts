import { logger } from '@/logger';
import type { ApiConfig, ApiResponse, Column } from '@/types';
import { http, invalidateQueries, notify } from '@/utils';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

const sortColumn: Column<any> = {
  title: '#',
  key: 'sort',
  width: 50,
  align: 'center'
};

type UseDragDropType<T extends Record<string, any>> = {
  key: string;
  objectName: string;
  data: T[];
  apiConfig: ApiConfig;
  sortField?: keyof T;
  updateOnDragEnd?: boolean;
  mappingData?: (record: T, index: number) => Record<string, any>;
};

const useDragDrop = <T extends Record<string, any>>({
  key,
  objectName,
  data,
  apiConfig,
  sortField = 'ordering',
  updateOnDragEnd,
  mappingData
}: UseDragDropType<T>) => {
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [sortedData, setSortedData] = useState<T[]>(
    (data.length > 0 && data.sort((a, b) => a?.[sortField] - b?.[sortField])) ||
      []
  );

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateOrdering', apiConfig.baseUrl],
    mutationFn: (body: any) =>
      http.put<ApiResponse<any>>(apiConfig, {
        body
      })
  });

  const handleUpdate = useCallback(
    async (dataOverride?: T[]) => {
      const finalData = dataOverride || sortedData;

      let dataUpdate: Record<string, any>[] = [];

      finalData.forEach((item, index) => {
        let baseData = {
          id: item.id,
          [sortField]: index
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
    if (data) setSortedData(data);
    else setSortedData([]);
  }, [data]);

  return {
    isChanged,
    sortColumn,
    sortedData,
    loading: isPending,
    setIsChanged,
    onDragEnd,
    handleUpdate
  };
};

export default useDragDrop;
