import { VideoLibraryList } from '@/app/video-library/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thư viện video'
};

export default function VideoLibraryListPage() {
  return <VideoLibraryList queryKey={queryKeys.VIDEO_LIBRARY} />;
}
