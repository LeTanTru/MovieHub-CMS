import { BusinessList } from '@/app/customer/[id]/business/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doanh nghiệp'
};

export default function BusinessPage() {
  return <BusinessList queryKey={queryKeys.BUSINESS} />;
}
