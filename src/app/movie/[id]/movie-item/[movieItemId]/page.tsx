import { MovieItemForm } from '@/app/movie/[id]/movie-item/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mục phim'
};

export default function MovieSavePage() {
  return <MovieItemForm queryKey={queryKeys.MOVIE_ITEM} />;
}
