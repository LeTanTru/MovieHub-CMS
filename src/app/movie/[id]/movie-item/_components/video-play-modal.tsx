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
  VolumeToggleButton
} from '@/components/video-player';
import { VideoLibraryResType } from '@/types';
import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  MediaProviderAdapter,
  MediaProviderChangeEvent,
  Poster
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import { getData, renderImageUrl, renderVideoUrl, renderVttUrl } from '@/utils';
import { storageKeys, VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL } from '@/constants';

export default function VideoPlayModal({
  open,
  video,
  close
}: {
  video?: VideoLibraryResType;
  open: boolean;
  close: () => void;
}) {
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
  return (
    <Modal
      title={video?.name}
      className='[&_.content]:w-300'
      open={open}
      onClose={close}
    >
      <div>
        <MediaPlayer
          viewType='video'
          streamType='on-demand'
          logLevel='silent'
          crossOrigin
          playsInline
          muted
          preferNativeHLS={false}
          autoPlay={false}
          src={renderVideoUrl(video?.content)}
          onProviderChange={
            video?.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
              ? onProviderChange
              : undefined
          }
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
              googleCastButton: null
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
