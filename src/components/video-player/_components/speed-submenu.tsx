'use client';

import { Menu, usePlaybackRateOptions } from '@vidstack/react';
import { OdometerIcon } from '@vidstack/react/icons';
import { submenuClass } from './styles';
import SubmenuButton from './submenu-button';
import SpeedSlider from './speed-slider';

export default function SpeedSubmenu() {
  const options = usePlaybackRateOptions({
    rates: [
      0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85,
      0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55,
      1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2
    ]
  });

  const hint = options.selectedValue + 'x';

  return (
    <Menu.Root>
      <SubmenuButton label='Tốc độ' hint={hint} icon={OdometerIcon} />

      <Menu.Content className={submenuClass}>
        <div className='p-2'>
          <div className='flex items-center gap-2 rounded-sm bg-white/10 px-3'>
            <SpeedSlider />
          </div>
        </div>
      </Menu.Content>
    </Menu.Root>
  );
}
