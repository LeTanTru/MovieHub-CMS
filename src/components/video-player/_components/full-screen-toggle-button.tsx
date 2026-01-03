'use client';

import { FullscreenButton, Tooltip, useMediaState } from '@vidstack/react';
import { FullscreenExitIcon, FullscreenIcon } from '@vidstack/react/icons';

export default function FullscreenToggleButton() {
  const isFullscreen = useMediaState('fullscreen');

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <FullscreenButton className='vds-button'>
          {!isFullscreen ? (
            <FullscreenIcon className='fs-enter-icon vds-icon' />
          ) : (
            <FullscreenExitIcon className='fs-exit-icon vds-icon' />
          )}
        </FullscreenButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        {isFullscreen
          ? 'Thoát khỏi chế độ toàn màn hình'
          : 'Bật chế độ toàn màn hình'}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
