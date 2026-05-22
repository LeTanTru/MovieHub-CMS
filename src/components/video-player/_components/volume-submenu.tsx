'use client';

import { submenuClass } from './styles';
import { SubmenuButton } from './submenu-button';
import { Menu, useMediaState, VolumeSlider } from '@vidstack/react';
import {
  MusicIcon,
  VolumeHighIcon,
  VolumeLowIcon
} from '@vidstack/react/icons';

export function VolumeSubmenu() {
  const volume = useMediaState('volume');
  const currentVolume = Math.round(Number(volume ?? 0) * 100);

  return (
    <Menu.Root>
      <SubmenuButton
        label='Âm lượng'
        hint={`${currentVolume}%`}
        icon={MusicIcon}
      />
      <Menu.Content className={submenuClass}>
        <div className='p-2'>
          <div className='flex items-center gap-2 rounded-sm bg-white/10 px-3'>
            <VolumeLowIcon className='size-4 shrink-0 text-white/70' />
            <VolumeSlider.Root className='vds-slider w-full'>
              <VolumeSlider.Track className='vds-slider-track' />
              <VolumeSlider.TrackFill className='vds-slider-track-fill vds-slider-track' />
              <VolumeSlider.Thumb className='vds-slider-thumb' />
            </VolumeSlider.Root>
            <VolumeHighIcon className='size-4 shrink-0 text-white/70' />
          </div>
        </div>
      </Menu.Content>
    </Menu.Root>
  );
}
