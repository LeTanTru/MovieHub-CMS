'use client';

import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import {
  BufferingIndicator,
  CaptionButton,
  DefaultQuality,
  FullscreenToggleButton,
  NextButton,
  PiPToggleButton,
  PlayPauseIndicator,
  PlayToggleButton,
  PreviousButton,
  SeekBackwardButton,
  SeekForwardButton,
  SettingMenu,
  SkipIntroButton,
  SkipOutroButton,
  TimeSlider,
  VolumeIndicator,
  VolumeToggleButton
} from './_components';
import {
  Gesture,
  isHLSProvider,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  MediaTimeUpdateEvent,
  Poster,
  TextTrack,
  TrackProps
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
  DefaultVideoLayoutSlots
} from '@vidstack/react/player/layouts/default';
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ComponentProps,
  Ref
} from 'react';
import { cn } from '@/lib';

import './video-player.css';

type IndicatorAction = 'initial' | 'play-pause' | 'volume' | 'none';
const IndicatorContext = createContext<{
  currentAction: IndicatorAction;
  setCurrentAction: (action: IndicatorAction) => void;
}>({
  currentAction: 'initial',
  setCurrentAction: () => {}
});

export const useIndicator = () => useContext(IndicatorContext);

type VideoPlayerProps = Omit<
  ComponentProps<typeof MediaPlayer>,
  'ref' | 'children' | 'viewType' | 'streamType'
> & {
  auth: boolean;
  defaultQuality?: number;
  duration: number;
  introEnd: number;
  introStart: number;
  next?: boolean;
  outroStart: number;
  prev?: boolean;
  skipOutro?: boolean;
  slots?: DefaultVideoLayoutSlots;
  textTracks?: TrackProps[];
  thumbnailUrl: string;
  token?: string;
  vttUrl: string;
  onNextClick?: () => void;
  onPrevClick?: () => void;
  onSeeked?: (currentTime: number) => void;
  hideVolumeIndicator?: boolean;
};

export function VideoPlayer({
  auth,
  defaultQuality = 0,
  duration,
  introEnd,
  introStart,
  next,
  outroStart,
  prev,
  skipOutro = false,
  slots,
  textTracks,
  thumbnailUrl,
  token,
  vttUrl,
  onNextClick,
  onPrevClick,
  onSeeked,
  hideVolumeIndicator = false,
  onTimeUpdate,
  onEnded,
  autoPlay = true,
  volume = 0.5,
  className,
  ref,
  ...mediaPlayerProps
}: VideoPlayerProps & { ref?: Ref<MediaPlayerInstance> }) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const [showSkipIntro, setShowSkipIntro] = useState<boolean>(false);
  const [showSkipOutro, setShowSkipOutro] = useState<boolean>(false);
  const [currentAction, setCurrentAction] =
    useState<IndicatorAction>('initial');

  const setPlayerRefs = useCallback(
    (instance: MediaPlayerInstance | null) => {
      playerRef.current = instance;
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    },
    [ref]
  );

  const handleTimeChange = (
    detail: MediaTimeUpdateEventDetail,
    nativeEvent: MediaTimeUpdateEvent
  ) => {
    const { currentTime } = detail;
    const shouldShowSkipIntro =
      currentTime >= introStart && currentTime < introEnd;
    const shouldShowSkipOutro =
      skipOutro &&
      !!onNextClick &&
      duration > 0 &&
      outroStart > 0 &&
      outroStart < duration &&
      currentTime >= outroStart &&
      currentTime < duration;

    setShowSkipIntro((prev) =>
      prev !== shouldShowSkipIntro ? shouldShowSkipIntro : prev
    );
    setShowSkipOutro((prev) =>
      prev !== shouldShowSkipOutro ? shouldShowSkipOutro : prev
    );
    onTimeUpdate?.(detail, nativeEvent);
  };

  return (
    <IndicatorContext.Provider value={{ currentAction, setCurrentAction }}>
      <MediaPlayer
        ref={setPlayerRefs}
        viewType='video'
        streamType='on-demand'
        logLevel='silent'
        crossOrigin
        playsInline
        preferNativeHLS={false}
        autoPlay={autoPlay}
        fullscreenOrientation='none'
        volume={volume}
        className={cn('video-player', className)}
        onProviderChange={
          auth ? (provider) => onProviderChange(provider, token) : undefined
        }
        onPlay={() => setCurrentAction('play-pause')}
        onPause={() => setCurrentAction('play-pause')}
        onVolumeChange={() => setCurrentAction('volume')}
        onTimeUpdate={handleTimeChange}
        onSeeked={onSeeked}
        onEnded={onEnded}
        {...mediaPlayerProps}
      >
        <MediaProvider slot='media' className='cursor-pointer'>
          <Poster className='vds-poster' src={thumbnailUrl} />
        </MediaProvider>
        <Gesture
          className='pointer-events-auto absolute inset-0 z-0 block h-full w-full'
          event='pointerup'
          action='toggle:paused'
        />
        <TextTrackSync textTracks={textTracks} playerRef={playerRef} />
        <DefaultQuality defaultQuality={defaultQuality} />
        <DefaultVideoLayout
          noGestures={true}
          smallLayoutWhen={false}
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
                <div className='max-640:hidden contents'>
                  {prev && onPrevClick && (
                    <PreviousButton onClick={onPrevClick} />
                  )}
                  {next && onNextClick && <NextButton onClick={onNextClick} />}
                  <SeekBackwardButton />
                  <SeekForwardButton />
                </div>
              </>
            ),
            googleCastButton: null,
            afterTimeSlider:
              showSkipIntro || showSkipOutro ? (
                <>
                  {showSkipIntro && (
                    <SkipIntroButton
                      onClick={() => {
                        if (playerRef.current && introEnd) {
                          playerRef.current.currentTime = introEnd;
                        }
                      }}
                    />
                  )}
                  {showSkipOutro && <SkipOutroButton onClick={onNextClick} />}
                </>
              ) : null,
            timeSlider: (
              <TimeSlider
                introStart={introStart}
                introEnd={introEnd}
                duration={duration}
                outroStart={outroStart}
                vttUrl={vttUrl}
              />
            ),
            bufferingIndicator: (
              <>
                <PlayPauseIndicator />
                <BufferingIndicator />
                {!hideVolumeIndicator && <VolumeIndicator />}
              </>
            ),
            ...slots
          }}
        />
      </MediaPlayer>
    </IndicatorContext.Provider>
  );
}

VideoPlayer.displayName = 'VideoPlayer';

/**
 * Imperatively syncs text tracks with the vidstack player instance.
 * Using declarative `<Track>` components can cause duplicate registrations
 * when the track list is updated during rapid successive re-renders
 * (e.g., multiple query invalidations after subtitle translation).
 */
function TextTrackSync({
  textTracks,
  playerRef
}: {
  textTracks?: TrackProps[];
  playerRef: React.RefObject<MediaPlayerInstance | null>;
}) {
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    // Clear all existing sideloaded subtitle tracks
    const existingTracks = [...player.textTracks];
    for (const track of existingTracks) {
      // Only remove tracks we manage (subtitles/captions added via src)
      if (
        (track.kind === 'subtitles' || track.kind === 'captions') &&
        track.src
      ) {
        player.textTracks.remove(track);
      }
    }

    // Add fresh tracks
    if (textTracks?.length) {
      for (const t of textTracks) {
        const textTrack = new TextTrack({
          src: t.src,
          label: t.label,
          language: t.language,
          kind: (t.kind as 'subtitles' | 'captions') ?? 'subtitles',
          type: t.type,
          default: t.default
        });
        player.textTracks.add(textTrack);
      }
    }

    return () => {
      // Cleanup on unmount
      if (!player) return;
      const tracks = [...player.textTracks];
      for (const track of tracks) {
        if (
          (track.kind === 'subtitles' || track.kind === 'captions') &&
          track.src
        ) {
          player.textTracks.remove(track);
        }
      }
    };
  }, [textTracks, playerRef]);

  return null;
}

function onProviderChange(
  provider: MediaProviderAdapter | null,
  token?: string
) {
  if (isHLSProvider(provider)) {
    provider.config = {
      xhrSetup(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    };
  }
}

/*
    * Set pointer to 'fine' for both touch and mouse devices
    
    useEffect(() => {
      let rafId: number;

      const setPointerFine = () => {
        const player = playerRef.current;
        if (!player) return;
        // Set via internal state signal so vidstack's reactive system reflects 'fine'
        player.$state.pointer.set('fine');
      };

      const setup = () => {
        const el = playerRef.current?.el;
        if (!el) return false;

        // Apply immediately for the current connection
        setPointerFine();

        // Re-apply every time vidstack reconnects (e.g. modal open/close).
        // 'media-player-connect' is dispatched at the end of onConnect,
        // after #onPointerChange has already set pointer to 'coarse'.
        el.addEventListener('media-player-connect', setPointerFine);
        return true;
      };

      let el: HTMLElement | undefined;
      if (!setup()) {
        rafId = requestAnimationFrame(() => {
          setup();
          el = playerRef.current?.el;
        });
      } else {
        el = playerRef.current?.el;
      }

      return () => {
        cancelAnimationFrame(rafId);
        el?.removeEventListener('media-player-connect', setPointerFine);
      };
    }, []);
    */
