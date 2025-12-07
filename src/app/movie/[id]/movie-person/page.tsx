import { MoviePersonTab } from '@/app/movie/[id]/movie-person/_components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn viên & đạo diễn'
};

export default function MovieLPersonListPage() {
  return <MoviePersonTab />;
}
