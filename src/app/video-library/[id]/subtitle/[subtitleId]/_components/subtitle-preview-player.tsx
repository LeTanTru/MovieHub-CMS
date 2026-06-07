'use client';

import { CircleLoading } from '@/components/loading';
import { envConfig } from '@/config';
import { useAuthStore, useVideoLibrarySubtitleStore } from '@/store';
import { VideoLibraryResType } from '@/types';
import {
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { MediaPlayerInstance } from '@vidstack/react';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => <CircleLoading className='stroke-sporty-blue m-4' />
  }
);

type SubtitlePreviewPlayerProps = {
  videoLibrary: VideoLibraryResType;
  playerContainerRef: React.Ref<HTMLDivElement>;
};

export function SubtitlePreviewPlayer({
  videoLibrary,
  playerContainerRef
}: SubtitlePreviewPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    currentTime,
    selectedSubtitleId,
    subtitleTimePickField,
    subtitles,
    setCurrentTime,
    startSeek,
    completeSeek,
    selectSubtitleTimePoint
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      selectedSubtitleId: s.selectedSubtitleId,
      subtitleTimePickField: s.subtitleTimePickField,
      subtitles: s.subtitles,
      setCurrentTime: s.setCurrentTime,
      startSeek: s.startSeek,
      completeSeek: s.completeSeek,
      selectSubtitleTimePoint: s.selectSubtitleTimePoint
    }))
  );

  const markers = subtitles.map((subtitle) => ({
    id: subtitle.id,
    start: subtitle.startTime,
    end: subtitle.endTime
  }));

  const activeSubtitle = subtitles.find(
    (subtitle) =>
      currentTime >= subtitle.startTime && currentTime < subtitle.endTime
  );

  const selectedSubtitle = selectedSubtitleId
    ? subtitles.find((subtitle) => subtitle.id === selectedSubtitleId)
    : undefined;
  const selectedSubtitleStartTime = selectedSubtitle?.startTime;

  const previewSubtitle = selectedSubtitle ?? activeSubtitle;

  useEffect(() => {
    if (!playerRef.current || selectedSubtitleStartTime === undefined) return;

    playerRef.current.currentTime = selectedSubtitleStartTime;
    playerRef.current.pause();
  }, [selectedSubtitleId, selectedSubtitleStartTime]);

  const handleSeek = (currentTime: number) => {
    completeSeek(currentTime);
  };

  return (
    <div ref={playerContainerRef} className='relative aspect-video w-full'>
      <VideoPlayer
        ref={playerRef}
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
        onTimeUpdate={(detail) => setCurrentTime(detail.currentTime)}
        onSeeking={startSeek}
        onSeeked={handleSeek}
        markers={markers}
        activeMarkerId={previewSubtitle?.id}
        isTimeSliderSelectionActive={!!subtitleTimePickField}
        onTimeSliderSelect={selectSubtitleTimePoint}
      />

      {previewSubtitle?.text ? (
        <div className='pointer-events-none absolute right-6 bottom-16 left-6 z-10 flex justify-center text-center'>
          <p className='max-w-[90%] px-3 py-1.5 text-lg whitespace-pre-line text-white'>
            {previewSubtitle.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
