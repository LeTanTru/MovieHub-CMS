import { MovieItemSeasonDetailList } from '@/app/movie/[id]/movie-item/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tập, trailer'
};

export default function MovieItemListPage() {
  return <MovieItemSeasonDetailList queryKey={queryKeys.MOVIE_ITEM} />;
}
