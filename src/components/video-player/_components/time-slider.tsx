'use client';

import { Activity } from '@/components/activity';
import { cn } from '@/lib';
import { TimeSlider as BaseTimeSlider } from '@vidstack/react';
import { useMemo } from 'react';

export default function TimeSlider({
  introStart,
  introEnd,
  outroStart,
  duration,
  vttUrl
}: {
  introStart: number;
  introEnd: number;
  outroStart: number;
  duration: number;
  vttUrl: string;
}) {
  return (
    <BaseTimeSlider.Root className='group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none items-center rounded outline-none select-none aria-hidden:hidden'>
      <BaseTimeSlider.Track className='relative z-0 h-[5px] w-full overflow-hidden rounded-sm bg-white/30 ring-sky-400 group-data-focus:ring-[3px]'>
        <BaseTimeSlider.TrackFill className='absolute h-full w-(--slider-fill) rounded-sm bg-[#f5f5f5] will-change-[width]' />
        <BaseTimeSlider.Progress className='absolute z-10 h-full w-(--slider-progress) rounded-sm bg-[#ffffff80] will-change-[width]' />

        <Activity visible={duration > 0 && introEnd > introStart}>
          <IntroRangeHighlight
            start={introStart || 0}
            end={introEnd}
            duration={duration}
          />
        </Activity>

        <Activity
          visible={duration > 0 && outroStart > 0 && outroStart < duration}
        >
          <IntroRangeHighlight
            start={outroStart}
            end={duration}
            duration={duration}
          />
        </Activity>
      </BaseTimeSlider.Track>

      <BaseTimeSlider.Preview
        className='pointer-events-none flex flex-col items-center opacity-0 transition-opacity duration-200 data-visible:opacity-100'
        noClamp
      >
        <BaseTimeSlider.Thumbnail.Root
          className='block h-(--thumbnail-height) max-h-40 min-h-20 w-(--thumbnail-width) max-w-[180px] min-w-[120px] overflow-hidden border border-white bg-black'
          src={vttUrl}
        >
          <BaseTimeSlider.Thumbnail.Img />
        </BaseTimeSlider.Thumbnail.Root>
        <BaseTimeSlider.Value className='rounded-sm bg-black px-2 py-px text-[13px] font-medium text-white' />
      </BaseTimeSlider.Preview>

      <BaseTimeSlider.Thumb className='absolute top-1/2 left-(--slider-fill) z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-active:opacity-100 group-data-dragging:ring-4' />
    </BaseTimeSlider.Root>
  );
}

function IntroRangeHighlight({
  start,
  end,
  duration
}: {
  start: number;
  end: number;
  duration: number;
}) {
  const styles = useMemo(() => {
    const left = (start / duration) * 100;
    const width = ((end - start) / duration) * 100;

    return {
      left: `${left}%`,
      width: `${width}%`
    };
  }, [start, end, duration]);

  const isAtStart = useMemo(() => start === 0, [start]);

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 h-full bg-gray-200/50 transition-all duration-200',
        {
          'rounded-tl rounded-bl': isAtStart
        }
      )}
      style={styles}
    />
  );
}
