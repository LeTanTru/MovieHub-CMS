import { CustomerForm } from '@/app/customer/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doanh nghiệp'
};

export default async function CustomerSavePage() {
  return <CustomerForm queryKey={queryKeys.CUSTOMER} />;
}
