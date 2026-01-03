'use client';

import { PIPButton, Tooltip, useMediaState } from '@vidstack/react';
import {
  PictureInPictureExitIcon,
  PictureInPictureIcon
} from '@vidstack/react/icons';

export default function PiPToggleButton() {
  const isPiP = useMediaState('pictureInPicture');
  const isPiPSupported = useMediaState('canPictureInPicture');

  if (!isPiPSupported) return null;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <PIPButton className='vds-button'>
          {isPiP ? (
            <PictureInPictureExitIcon className='vds-icon' />
          ) : (
            <PictureInPictureIcon className='vds-icon' />
          )}
        </PIPButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        {isPiP ? 'Thoát chế độ phát thu nhỏ' : 'Vào chế độ phát thu nhỏ'}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
