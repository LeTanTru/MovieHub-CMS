import { ListPageSkeleton } from '@/components/loading';

export default function Loading() {
  return (
    <ListPageSkeleton hasSearchForm={false} hasTabs={true} tabsCount={3} />
  );
}
