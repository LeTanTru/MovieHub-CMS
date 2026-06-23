import { ListPageSkeleton } from '@/components/loading';

export default function Loading() {
  return (
    <ListPageSkeleton searchFieldsCount={4} hasTabs={true} tabsCount={2} />
  );
}
