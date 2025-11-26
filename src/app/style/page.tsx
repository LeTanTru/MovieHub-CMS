import { StyleList } from '@/app/style/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thiết kế'
};

export default function StyleListPage() {
  return <StyleList queryKey={queryKeys.STYLE} />;
}
