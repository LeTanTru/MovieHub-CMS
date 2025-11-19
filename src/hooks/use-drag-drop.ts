'use client';

import { logger } from '@/logger';
import { ApiConfig, ApiResponse, Column } from '@/types';
import { http, notify } from '@/utils';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

const sortColumn: Column<any> = {
  title: '#',
  key: 'sort',
  width: 50,
  align: 'center'
};

const useDragDrop = <T extends Record<string, any>>({
  key,
  objectName,
  data,
  apiConfig,
  sortField = 'ordering'
}: {
  key: string;
  objectName: string;
  data: T[];
  apiConfig: ApiConfig;
  sortField?: keyof T;
}) => {
  const queryClient = useQueryClient();
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [sortedData, setSortedData] = useState<T[]>(
    (data.length > 0 && data.sort((a, b) => a?.[sortField] - b?.[sortField])) ||
      []
  );

  const updateOrderingMutation = useMutation({
    mutationKey: ['updateOrdering', apiConfig.baseUrl],
    mutationFn: (body: any) =>
      http.put<ApiResponse<any>>(apiConfig, {
        body
      })
  });

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    },
    [sortedData]
  );

  const handleUpdate = useCallback(async () => {
    let dataUpdate: Record<string, any> = [];
    const sortList = data.length > 0 ? data : sortedData;
    sortList.map((item, index) => {
      dataUpdate.push({
        id: item.id,
        [sortField]: index
      });
    });
    await updateOrderingMutation.mutateAsync(dataUpdate, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [key]
        });
        setIsChanged(false);

        notify.success(`Cập nhật thứ tự ${objectName} thành công`);
      },
      onError: (error) => {
        logger.error('Error while updating ordering:', error);
        notify.error(`Cập nhật thứ tự ${objectName} thất bại`);

        setIsChanged(false);
      }
    });
  }, [
    data,
    key,
    objectName,
    queryClient,
    sortField,
    sortedData,
    updateOrderingMutation
  ]);

  useEffect(() => {
    if (data) setSortedData(data);
    else setSortedData([]);
  }, [data]);

  return {
    isChanged,
    setIsChanged,
    sortedData,
    onDragEnd,
    handleUpdate,
    loading: updateOrderingMutation.isPending,
    sortColumn
  };
};

export default useDragDrop;
