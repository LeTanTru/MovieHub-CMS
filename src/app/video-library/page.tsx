import { VideoLibraryList } from '@/app/video-library/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Video'
};

export default function VideoLibraryListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <VideoLibraryList />
    </Suspense>
  );
}
