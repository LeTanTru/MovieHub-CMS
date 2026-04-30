import { VideoLibraryForm } from '@/app/video-library/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function VideoLibrarySavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <VideoLibraryForm />
    </Suspense>
  );
}
