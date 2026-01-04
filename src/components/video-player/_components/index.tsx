// 'use client';

// import '@vidstack/react/player/styles/default/theme.css';
// import '@vidstack/react/player/styles/default/layouts/audio.css';
// import '@vidstack/react/player/styles/default/layouts/video.css';
// import { MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react';
// import {
//   DefaultVideoLayout,
//   defaultLayoutIcons
// } from '@vidstack/react/player/layouts/default';
// import PlayToggleButton from '@/components/video-player/PlayToggleButton';
// import VolumeToggleButton from '@/components/video-player/VolumeToggleButton';
// import FullscreenToggleButton from '@/components/video-player/FullscreenToggleButton';
// import PiPToggleButton from '@/components/video-player/PiPToggleButton';
// import SettingMenu from '@/components/video-player/SettingMenu';
// import CaptionButton from '@/components/video-player/CaptionButton';
// import SeekBackwardButton from '@/components/video-player/SeekBackwardButton';
// import SeekForwardButton from '@/components/video-player/SeekForwardButton';

// export default function VideoPlayer() {
//   const textTracks = [
//     {
//       src: 'https://files.vidstack.io/sprite-fight/subs/english.vtt',
//       label: 'English',
//       language: 'en-US',
//       kind: 'subtitles',
//       type: 'vtt',
//       default: true
//     },
//     {
//       src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
//       label: 'Spanish',
//       language: 'es-ES',
//       kind: 'subtitles',
//       type: 'vtt'
//     },
//     {
//       src: 'https://files.vidstack.io/sprite-fight/chapters.vtt',
//       language: 'en-US',
//       kind: 'chapters',
//       type: 'vtt',
//       default: true
//     }
//   ];

//   return (
//     <div>
//       <MediaPlayer
//         viewType='video'
//         streamType='on-demand'
//         logLevel='warn'
//         crossOrigin
//         playsInline
//         muted
//         preferNativeHLS={false}
//         autoPlay={false}
//         src='https://files.vidstack.io/sprite-fight/hls/stream.m3u8'
//       >
//         <MediaProvider slot='media'>
//           <Poster
//             className='vds-poster'
//             src='https://files.vidstack.io/sprite-fight/poster.webp'
//           />
//           {textTracks.map((track) => (
//             <Track {...(track as any)} key={track.src} />
//           ))}
//         </MediaProvider>
//         <DefaultVideoLayout
//           thumbnails='https://files.vidstack.io/sprite-fight/thumbnails.vtt'
//           icons={defaultLayoutIcons}
//           slots={{
//             playButton: <PlayToggleButton />,
//             muteButton: <VolumeToggleButton />,
//             fullscreenButton: <FullscreenToggleButton />,
//             pipButton: <PiPToggleButton />,
//             settingsMenu: (
//               <SettingMenu placement='top end' tooltipPlacement='top' />
//             ),
//             captionButton: <CaptionButton />,
//             beforeSettingsMenu: (
//               <>
//                 <SeekBackwardButton />
//                 <SeekForwardButton />
//               </>
//             ),
//             googleCastButton: null
//           }}
//         />
//       </MediaPlayer>
//     </div>
//   );
// }
export { default as CaptionButton } from './caption-button';
export { default as FullscreenToggleButton } from './full-screen-toggle-button';
export { default as NextButton } from './next-button';
export { default as PiPToggleButton } from './pip-toggle-button';
export { default as PlayToggleButton } from './play-toggle-button';
export { default as PreviousButton } from './previous-button';
export { default as SeekBackwardButton } from './seek-backward-button';
export { default as SeekForwardButton } from './seek-forward-button';
export { default as SettingMenu } from './setting-menu';
export { default as SkipIntroButton } from './skip-intro-button';
export { default as TimeSlider } from './time-slider';
export { default as VolumeToggleButton } from './volume-toggle-button';
