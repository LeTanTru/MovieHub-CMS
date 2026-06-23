import { ListPageSkeleton } from '@/components/loading';

export default function Loading() {
  return <ListPageSkeleton searchFieldsCount={2} breadcrumbLevel={4} />;
}
