import { getQueryClient } from '@/components/providers/query-provider';

export const invalidateQueries = (keys: string[]) => {
  const queryClient = getQueryClient();
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

export const removeQueries = (keys: string[]) => {
  const queryClient = getQueryClient();
  keys.forEach((key) => {
    queryClient.removeQueries({ queryKey: [key] });
  });
};
