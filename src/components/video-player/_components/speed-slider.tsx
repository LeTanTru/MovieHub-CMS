'use client';

import { SpeedSlider as BaseSpeedSlider } from '@vidstack/react';

export default function SpeedSlider() {
  return (
    <BaseSpeedSlider.Root
      className='group vds-slider relative inline-flex cursor-pointer touch-none items-center py-2.5 outline-none select-none aria-hidden:hidden'
      min={0.25}
      max={2}
      step={0.05}
      keyStep={0.05}
    >
      <BaseSpeedSlider.Track className='relative z-0 h-[5px] w-full rounded-sm bg-white/30 ring-sky-400 group-data-[focus]:ring-[3px]'>
        <BaseSpeedSlider.TrackFill className='absolute h-full w-[var(--slider-fill)] rounded-sm bg-white will-change-[width]' />
      </BaseSpeedSlider.Track>

      <BaseSpeedSlider.Thumb className='absolute top-1/2 left-[var(--slider-fill)] z-20 size-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity will-change-[left] group-data-[active]:opacity-100 group-data-[dragging]:ring-4' />
    </BaseSpeedSlider.Root>
  );
}
