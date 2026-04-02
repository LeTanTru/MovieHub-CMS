import { CollectionList } from '@/app/collection/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bộ sưu tập'
};

export default function CollectionListPage() {
  return <CollectionList />;
}
