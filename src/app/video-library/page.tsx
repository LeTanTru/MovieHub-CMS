import { VideoLibraryList } from '@/app/video-library/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video'
};

export default function VideoLibraryListPage() {
  return <VideoLibraryList />;
}
