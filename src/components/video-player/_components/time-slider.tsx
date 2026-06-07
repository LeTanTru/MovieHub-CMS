'use client';

import { TimeSlider as BaseTimeSlider } from '@vidstack/react';
import {
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useEffect,
  useState
} from 'react';
import { TimeSliderHighlight } from './time-slider-highlight';
import { TimeSliderMarker } from './time-slider-marker';
import { TimeSliderMarkerType } from '@/types';
import { secondsToVttTime } from '@/utils';

type TimeSliderProps = {
  introStart: number;
  introEnd: number;
  outroStart: number;
  duration: number;
  vttUrl: string;
  markers?: TimeSliderMarkerType[];
  activeMarkerId?: string | null;
  isTimeSliderSelectionActive?: boolean;
  onTimeSliderSelect?: (time: number) => void;
};

type SelectionHoverPreview = {
  left: number;
  time: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getSelectionHoverPreview = (
  event: ReactPointerEvent<HTMLElement>,
  duration: number
): SelectionHoverPreview | null => {
  if (duration <= 0 || !Number.isFinite(duration)) return null;

  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width <= 0) return null;

  const pointerRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);

  return {
    left: Number((pointerRatio * 100).toFixed(2)),
    time: Number((pointerRatio * duration).toFixed(3))
  };
};

export function TimeSlider({
  introStart,
  introEnd,
  outroStart,
  duration,
  vttUrl,
  markers,
  activeMarkerId,
  isTimeSliderSelectionActive = false,
  onTimeSliderSelect
}: TimeSliderProps) {
  const [selectionHoverPreview, setSelectionHoverPreview] =
    useState<SelectionHoverPreview | null>(null);

  useEffect(() => {
    if (!isTimeSliderSelectionActive) {
      setSelectionHoverPreview(null);
    }
  }, [isTimeSliderSelectionActive]);

  const stopSelectionEvent = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  const handleSelectionPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    stopSelectionEvent(event);

    const hoverPreview = getSelectionHoverPreview(event, duration);
    if (!hoverPreview) return;

    setSelectionHoverPreview(hoverPreview);
    onTimeSliderSelect?.(hoverPreview.time);
  };

  const handleSelectionPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    stopSelectionEvent(event);
    setSelectionHoverPreview(getSelectionHoverPreview(event, duration));
  };

  const handleSelectionPointerLeave = (
    event: ReactPointerEvent<HTMLElement>
  ) => {
    stopSelectionEvent(event);
    setSelectionHoverPreview(null);
  };

  return (
    <div className='relative mx-[7.5px] inline-flex h-10 w-full'>
      <BaseTimeSlider.Root className='group relative inline-flex h-full w-full cursor-pointer touch-none items-center rounded outline-none select-none aria-hidden:hidden'>
        <BaseTimeSlider.Track className='relative z-0 h-1.25 w-full overflow-hidden rounded-sm bg-white/30 ring-sky-400 group-data-focus:ring-[3px]'>
          <BaseTimeSlider.TrackFill className='absolute h-full w-(--slider-fill) rounded-sm bg-[#f5f5f5] will-change-[width]' />
          <BaseTimeSlider.Progress className='absolute z-10 h-full w-(--slider-progress) rounded-sm bg-[#ffffff80] will-change-[width]' />

          {duration > 0 && introEnd > introStart && (
            <TimeSliderHighlight
              start={introStart || 0}
              end={introEnd}
              duration={duration}
            />
          )}

          {duration > 0 && outroStart > 0 && outroStart < duration && (
            <TimeSliderHighlight
              start={outroStart}
              end={duration}
              duration={duration}
            />
          )}

          <TimeSliderMarker
            markers={markers}
            duration={duration}
            activeMarkerId={activeMarkerId}
          />
        </BaseTimeSlider.Track>

        <BaseTimeSlider.Preview
          className='pointer-events-none flex flex-col items-center opacity-0 transition-opacity duration-200 data-visible:opacity-100'
          noClamp
        >
          <BaseTimeSlider.Thumbnail.Root
            className='block h-(--thumbnail-height) max-h-40 min-h-20 w-(--thumbnail-width) max-w-45 min-w-30 overflow-hidden border border-white bg-black'
            src={vttUrl}
          >
            <BaseTimeSlider.Thumbnail.Img />
          </BaseTimeSlider.Thumbnail.Root>
          <BaseTimeSlider.Value className='rounded-sm bg-black px-2 py-px text-[13px] font-medium text-white' />
        </BaseTimeSlider.Preview>

        <BaseTimeSlider.Thumb className='absolute top-1/2 left-(--slider-fill) z-20 size-3.75 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-active:opacity-100 group-data-dragging:ring-4' />
      </BaseTimeSlider.Root>

      {isTimeSliderSelectionActive && (
        <>
          {selectionHoverPreview ? (
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 z-40'
            >
              <span
                className='absolute top-1/2 h-6 w-px -translate-y-1/2 bg-sky-300/90 shadow-[0_0_8px_rgba(125,211,252,0.9)]'
                style={{
                  left: `${selectionHoverPreview.left}%`
                }}
              />
              <span
                className='absolute bottom-full mb-1.5 -translate-x-1/2 rounded-sm border border-white/15 bg-black/90 px-2 py-1 text-[12px] leading-none font-semibold text-white tabular-nums shadow-lg'
                style={{
                  left: `clamp(4rem, ${selectionHoverPreview.left}%, calc(100% - 4rem))`
                }}
              >
                {secondsToVttTime(selectionHoverPreview.time)}
              </span>
            </div>
          ) : null}
          <button
            type='button'
            aria-label='Select subtitle time from timeline'
            className='absolute inset-0 z-30 cursor-crosshair touch-none border-0 bg-transparent p-0'
            onClick={stopSelectionEvent}
            onPointerCancel={handleSelectionPointerLeave}
            onPointerDown={handleSelectionPointerDown}
            onPointerEnter={handleSelectionPointerMove}
            onPointerLeave={handleSelectionPointerLeave}
            onPointerMove={handleSelectionPointerMove}
            onPointerUp={stopSelectionEvent}
          />
        </>
      )}
    </div>
  );
}
