import { MovieItemSeasonList } from '@/app/movie/[id]/movie-item/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mùa'
};

export default function MovieItemListPage() {
  return <MovieItemSeasonList queryKey={queryKeys.MOVIE_ITEM} />;
}
