import { MovieItemSeasonList } from '@/app/movie/[id]/movie-item/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phần'
};

export default function MovieItemListPage() {
  return <MovieItemSeasonList />;
}
