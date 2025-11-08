import { ServerProviderList } from '@/app/server-provider/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Máy chủ'
};

export default function CustomerPage() {
  return <ServerProviderList queryKey={queryKeys.SERVER_PROVIDER} />;
}
