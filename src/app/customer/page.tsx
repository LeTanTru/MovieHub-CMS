import { CustomerList } from '@/app/customer/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Khách hàng'
};

export default function CustomerPage() {
  return <CustomerList queryKey={queryKeys.CUSTOMER} />;
}
