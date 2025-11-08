import { BusinessForm } from '@/app/customer/[id]/business/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doanh nghiệp'
};

export default function BusinessSavePage() {
  return <BusinessForm queryKey={queryKeys.BUSINESS} />;
}
