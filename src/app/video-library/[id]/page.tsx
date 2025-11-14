import { VideoLibraryForm } from '@/app/video-library/_components';
import { queryKeys } from '@/constants';

export default function VideoLibrarySavePage() {
  return <VideoLibraryForm queryKey={queryKeys.CATEGORY} />;
}
