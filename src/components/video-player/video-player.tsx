'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import {
  BufferingIndicator,
  CaptionButton,
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
  isHLSProvider,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  MediaTimeUpdateEvent,
  Poster,
  Track,
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
  useRef,
  useState,
  forwardRef,
  ComponentProps
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

const VideoPlayer = forwardRef<MediaPlayerInstance, VideoPlayerProps>(
  function VideoPlayer(
    {
      auth,
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
      ...mediaPlayerProps
    },
    ref
  ) {
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
            {textTracks?.map((track) => (
              <Track {...(track as any)} key={track.src} />
            ))}
          </MediaProvider>
          <DefaultVideoLayout
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
                    {next && onNextClick && (
                      <NextButton onClick={onNextClick} />
                    )}
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
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

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
