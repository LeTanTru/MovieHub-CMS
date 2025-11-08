import { ServerProviderForm } from '@/app/server-provider/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Máy chủ'
};

export default async function ServerProviderSavePage() {
  return <ServerProviderForm queryKey={queryKeys.CUSTOMER} />;
}
