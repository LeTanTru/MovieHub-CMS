import { MovieForm } from '@/app/movie/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim'
};

export default function MovieSavePage() {
  return <MovieForm queryKey={queryKeys.MOVIE} />;
}
