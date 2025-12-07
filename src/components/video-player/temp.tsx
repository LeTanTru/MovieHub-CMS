'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Modal } from '@/components/modal';
import {
  CaptionButton,
  FullscreenToggleButton,
  PiPToggleButton,
  PlayToggleButton,
  SeekBackwardButton,
  SeekForwardButton,
  SettingMenu,
  SkipIntroButton,
  VolumeToggleButton
} from '@/components/video-player';
import { VideoLibraryResType } from '@/types';
import {
  isHLSProvider,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaProviderChangeEvent,
  MediaTimeUpdateEvent,
  MediaTimeUpdateEventDetail,
  Poster,
  TimeSlider
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import { getData, renderImageUrl, renderVideoUrl, renderVttUrl } from '@/utils';
import { storageKeys, VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL } from '@/constants';
import { useRef, useState } from 'react';
import { cn } from '@/lib';

export default function VideoPlayModal({
  open,
  video,
  close
}: {
  video?: VideoLibraryResType;
  open: boolean;
  close: () => void;
}) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [showSkip, setShowSkip] = useState<boolean>(true);

  // const textTracks = [
  //   {
  //     src: 'https://files.vidstack.io/sprite-fight/subs/english.vtt',
  //     label: 'English',
  //     language: 'en-US',
  //     kind: 'subtitles',
  //     type: 'vtt',
  //     default: true
  //   },
  //   {
  //     src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
  //     label: 'Spanish',
  //     language: 'es-ES',
  //     kind: 'subtitles',
  //     type: 'vtt'
  //   },
  //   {
  //     src: 'https://files.vidstack.io/sprite-fight/chapters.vtt',
  //     language: 'en-US',
  //     kind: 'chapters',
  //     type: 'vtt',
  //     default: true
  //   }
  // ];
  const handleTimeChange = (
    detail: MediaTimeUpdateEventDetail,
    nativeEvent: MediaTimeUpdateEvent
  ) => {
    if (!showSkip || !video?.introEnd) return;

    const currentTime = detail.currentTime;
    setShowSkip(currentTime < video.introEnd);
  };

  return (
    <Modal
      title={video?.name}
      className='[&_.content]:w-300'
      open={open}
      onClose={close}
    >
      <div>
        <MediaPlayer
          ref={playerRef}
          viewType='video'
          streamType='on-demand'
          logLevel='silent'
          crossOrigin
          playsInline
          preferNativeHLS={false}
          autoPlay
          src={renderVideoUrl(video?.content)}
          fullscreenOrientation={'none'}
          onProviderChange={onProviderChange}
          volume={0.5}
          onTimeUpdate={handleTimeChange}
        >
          <MediaProvider slot='media'>
            <Poster
              className='vds-poster'
              src={renderImageUrl(video?.thumbnailUrl)}
            />
            {/* {textTracks.map((track) => (
                                  <Track {...(track as any)} key={track.src} />
                                ))} */}
          </MediaProvider>
          <DefaultVideoLayout
            thumbnails={renderVttUrl(video?.vttUrl)}
            icons={defaultLayoutIcons}
            slots={{
              playButton: <PlayToggleButton />,
              muteButton: <VolumeToggleButton />,
              fullscreenButton: <FullscreenToggleButton />,
              pipButton: <PiPToggleButton />,
              settingsMenu: (
                <SettingMenu placement='top end' tooltipPlacement='top' />
              ),
              captionButton: <CaptionButton />,
              beforeSettingsMenu: (
                <>
                  <SeekBackwardButton />
                  <SeekForwardButton />
                </>
              ),
              googleCastButton: null,
              afterTimeSlider: showSkip && (
                <SkipIntroButton
                  onClick={() => {
                    if (playerRef.current && video?.introEnd) {
                      playerRef.current.currentTime = video.introEnd;
                    }
                  }}
                />
              ),
              timeSlider: (
                <TimeSlider.Root className='group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none items-center rounded outline-none select-none aria-hidden:hidden'>
                  <TimeSlider.Track className='relative z-0 h-[5px] w-full overflow-hidden rounded-sm bg-white/30 ring-sky-400 group-data-[focus]:ring-[3px]'>
                    <TimeSlider.TrackFill className='absolute h-full w-[var(--slider-fill)] rounded-sm bg-red-500 will-change-[width]' />
                    <TimeSlider.Progress className='absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/80 will-change-[width]' />
                    {video && (
                      <IntroRangeHighlight
                        start={video.introStart || 0}
                        end={video.introEnd}
                        duration={video.duration}
                      />
                    )}
                    {video && (
                      <IntroRangeHighlight
                        start={video.outroStart}
                        end={video.duration}
                        duration={video.duration}
                      />
                    )}
                  </TimeSlider.Track>

                  <TimeSlider.Preview
                    className='pointer-events-none flex flex-col items-center opacity-0 transition-opacity duration-200 data-[visible]:opacity-100'
                    noClamp
                  >
                    <TimeSlider.Thumbnail.Root
                      className='block h-[var(--thumbnail-height)] max-h-[160px] min-h-[80px] w-[var(--thumbnail-width)] max-w-[180px] min-w-[120px] overflow-hidden border border-white bg-black'
                      src={renderVttUrl(video?.vttUrl)}
                    >
                      <TimeSlider.Thumbnail.Img />
                    </TimeSlider.Thumbnail.Root>
                    <TimeSlider.Value className='rounded-sm bg-black px-2 py-px text-[13px] font-medium text-white' />
                  </TimeSlider.Preview>

                  <TimeSlider.Thumb className='absolute top-1/2 left-[var(--slider-fill)] z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-[active]:opacity-100 group-data-[dragging]:ring-4' />
                </TimeSlider.Root>
              )
            }}
          />
        </MediaPlayer>
      </div>
    </Modal>
  );
}

function onProviderChange(
  provider: MediaProviderAdapter | null,
  nativeEvent: MediaProviderChangeEvent
) {
  if (isHLSProvider(provider)) {
    provider.config = {
      xhrSetup(xhr) {
        xhr.setRequestHeader(
          'Authorization',
          `Bearer ${getData(storageKeys.ACCESS_TOKEN)}`
        );
      }
    };
  }
}
function IntroRangeHighlight({
  start,
  end,
  duration
}: {
  start: number;
  end: number;
  duration?: number;
}) {
  if (!duration || duration === 0) return null;

  const left = (start / duration) * 100;
  const width = ((end - start) / duration) * 100;

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 h-full rounded-tr rounded-br bg-gray-300'
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`
      }}
    ></div>
  );
}
