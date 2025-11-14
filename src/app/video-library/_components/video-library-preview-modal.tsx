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
import { MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import { AppConstants } from '@/constants';
import { renderImageUrl, renderVideoUrl, renderVttUrl } from '@/utils';

export default function VideoLibraryPreviewModal({
  open,
  videoLibrary,
  close
}: {
  videoLibrary?: VideoLibraryResType;
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
      title={videoLibrary?.name}
      className='[&_.content]:w-300'
      open={open}
      onClose={close}
    >
      <div>
        <MediaPlayer
          viewType='video'
          streamType='on-demand'
          logLevel='warn'
          crossOrigin
          playsInline
          muted
          preferNativeHLS={false}
          autoPlay={false}
          src={renderVideoUrl(videoLibrary?.content)}
        >
          <MediaProvider slot='media'>
            <Poster
              className='vds-poster'
              src={renderImageUrl(videoLibrary?.thumbnailUrl)}
            />
            {/* {textTracks.map((track) => (
              <Track {...(track as any)} key={track.src} />
            ))} */}
          </MediaProvider>
          <DefaultVideoLayout
            thumbnails={renderVttUrl(videoLibrary?.vttUrl)}
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
