import { CategoryForm } from '@/app/category/_components';
import { queryKeys } from '@/constants';

export default function CategorySavePage() {
  return <CategoryForm queryKey={queryKeys.CATEGORY} />;
}
