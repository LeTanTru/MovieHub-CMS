'use client';

import { CircleLoading } from '@/components/loading';
import { envConfig } from '@/config';
import { useAuthStore } from '@/store';
import { VideoLibraryResType } from '@/types';
import {
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { TrackProps } from '@vidstack/react';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => <CircleLoading className='stroke-main-color m-4' />
  }
);

type SubtitlePreviewPlayerProps = {
  videoLibrary: VideoLibraryResType;
  textTracks: TrackProps[];
  playerContainerRef: React.Ref<HTMLDivElement>;
};

export function SubtitlePreviewPlayer({
  videoLibrary,
  textTracks,
  playerContainerRef
}: SubtitlePreviewPlayerProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <div ref={playerContainerRef} className='aspect-video w-full'>
      <VideoPlayer
        auth={true}
        src={renderVideoUrl(
          videoLibrary.hostname,
          videoLibrary.content,
          videoLibrary.sourceType
        )}
        token={accessToken || ''}
        duration={videoLibrary.duration}
        introEnd={videoLibrary.introEnd}
        introStart={videoLibrary.introStart}
        outroStart={videoLibrary.outroStart}
        thumbnailUrl={renderImageUrl(videoLibrary.thumbnailUrl)}
        vttUrl={renderVttUrl(
          videoLibrary.hostname,
          videoLibrary.vttUrl,
          videoLibrary.sourceType
        )}
        volume={
          envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
            ? 0
            : isMobileDevice() || isTabletDevice()
              ? 1
              : 0.5
        }
        textTracks={textTracks}
      />
    </div>
  );
}
