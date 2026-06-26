import { getQueryClient } from '@/components/providers/query-provider';

/**
 * @param args The query keys to invalidate
 */
export const invalidateQueries = (...args: (string | number | object)[][]) => {
  const queryClient = getQueryClient();
  args.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

/**
 * @param keys The query keys to remove
 */
export const removeQueries = (keys: string[]) => {
  const queryClient = getQueryClient();
  keys.forEach((key) => {
    queryClient.removeQueries({ queryKey: [key] });
  });
};
