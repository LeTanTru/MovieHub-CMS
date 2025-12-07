import { CommentList } from '@/app/movie/[id]/comment/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bình luận'
};

export default function CommentListPage() {
  return <CommentList queryKey={queryKeys.COMMENT} />;
}
