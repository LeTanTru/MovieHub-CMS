'use client';

import { TimeSliderHighlight } from './time-slider-highlight';
import { TimeSlider as BaseTimeSlider } from '@vidstack/react';

type TimeSliderProps = {
  introStart: number;
  introEnd: number;
  outroStart: number;
  duration: number;
  vttUrl: string;
};

export const TimeSlider = ({
  introStart,
  introEnd,
  outroStart,
  duration,
  vttUrl
}: TimeSliderProps) => {
  return (
    <BaseTimeSlider.Root className='group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none items-center rounded outline-none select-none aria-hidden:hidden'>
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
  );
};
