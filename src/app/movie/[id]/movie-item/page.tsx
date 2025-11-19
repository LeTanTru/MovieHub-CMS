import { MovieItemList } from '@/app/movie/[id]/movie-item/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mục phim'
};

export default function MovieListPage() {
  return <MovieItemList queryKey={queryKeys.MOVIE_ITEM} />;
}
