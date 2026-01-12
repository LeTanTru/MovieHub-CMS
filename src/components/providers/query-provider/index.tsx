'use client';

import { Activity } from '@/components/activity';
import { getQueryClient } from './get-query-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import envConfig from '@/config';

export default function QueryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Activity visible={envConfig.NEXT_PUBLIC_NODE_ENV === 'development'}>
        <ReactQueryDevtools initialIsOpen={false} />
      </Activity>
    </QueryClientProvider>
  );
}
