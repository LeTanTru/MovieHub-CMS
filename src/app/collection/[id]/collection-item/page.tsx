import { CollectionItemList } from '@/app/collection/[id]/collection-item/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim'
};

export default function CollectionItemListPage() {
  return <CollectionItemList />;
}
