'use client';

import {
  CaptionButton,
  FullscreenToggleButton,
  NextButton,
  PiPToggleButton,
  PlayToggleButton,
  PreviousButton,
  SeekBackwardButton,
  SeekForwardButton,
  SettingMenu,
  SkipIntroButton,
  TimeSlider,
  VolumeToggleButton
} from './_components';
import { storageKeys } from '@/constants';
import { getData } from '@/utils';
import {
  isHLSProvider,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  Poster,
  Track,
  TrackProps
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
  DefaultVideoLayoutSlots
} from '@vidstack/react/player/layouts/default';
import { useRef, useState } from 'react';

export default function VideoPlayer({
  auth,
  duration,
  introEnd,
  introStart,
  outroStart,
  slots,
  source,
  textTracks,
  thumbnailUrl,
  vttUrl
}: {
  auth: boolean;
  duration: number;
  introEnd: number;
  introStart: number;
  outroStart: number;
  slots?: DefaultVideoLayoutSlots;
  source: string;
  textTracks?: TrackProps[];
  thumbnailUrl: string;
  vttUrl: string;
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

  const handleTimeChange = (detail: MediaTimeUpdateEventDetail) => {
    const { currentTime } = detail;
    const shouldShowSkip = currentTime >= introStart && currentTime < introEnd;

    setShowSkip((prev) => (prev !== shouldShowSkip ? shouldShowSkip : prev));
  };
  return (
    <MediaPlayer
      ref={playerRef}
      viewType='video'
      streamType='on-demand'
      logLevel='silent'
      crossOrigin
      playsInline
      preferNativeHLS={false}
      autoPlay
      src={source}
      fullscreenOrientation={'none'}
      onProviderChange={auth ? onProviderChange : undefined}
      volume={0.5}
      className='rounded! border-none!'
      onTimeUpdate={handleTimeChange}
    >
      <MediaProvider
        slot='media'
        className='h-[calc(100%+5px)]! cursor-pointer'
      >
        <Poster className='vds-poster' src={thumbnailUrl} />
        {textTracks?.map((track) => (
          <Track {...(track as any)} key={track.src} />
        ))}
      </MediaProvider>
      <DefaultVideoLayout
        thumbnails={vttUrl}
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
              <PreviousButton />
              <NextButton />
              <SeekBackwardButton />
              <SeekForwardButton />
            </>
          ),
          googleCastButton: null,
          afterTimeSlider: showSkip ? (
            <SkipIntroButton
              onClick={() => {
                if (playerRef.current && introEnd) {
                  playerRef.current.currentTime = introEnd;
                }
              }}
            />
          ) : (
            <></>
          ),
          timeSlider: (
            <TimeSlider
              introStart={introStart}
              introEnd={introEnd}
              duration={duration}
              outroStart={outroStart}
              vttUrl={vttUrl}
            />
          ),
          ...slots
        }}
      />
    </MediaPlayer>
  );
}

function onProviderChange(
  provider: MediaProviderAdapter | null
  // nativeEvent: MediaProviderChangeEvent
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
