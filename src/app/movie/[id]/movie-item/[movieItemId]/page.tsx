import { MovieItemSeasonDetailList } from '@/app/movie/[id]/movie-item/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tập, trailer'
};

export default function MovieItemListPage() {
  return <MovieItemSeasonDetailList />;
}
