import { CategoryList } from '@/app/category/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Danh mục'
};

export default function CategoryListPage() {
  return <CategoryList queryKey={queryKeys.CATEGORY} />;
}
