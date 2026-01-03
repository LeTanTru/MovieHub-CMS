'use client';

import { MuteButton, Tooltip, useMediaState } from '@vidstack/react';
import { MuteIcon, VolumeHighIcon, VolumeLowIcon } from '@vidstack/react/icons';

export default function VolumeToggleButton() {
  const isMuted = useMediaState('muted');
  const volume = useMediaState('volume');

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <MuteIcon className='vds-icon' />;
    } else if (volume < 0.5) {
      return <VolumeLowIcon className='vds-icon' />;
    } else {
      return <VolumeHighIcon className='vds-icon' />;
    }
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <MuteButton className='vds-button'>{renderVolumeIcon()}</MuteButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        {isMuted || volume === 0 ? 'Bật âm' : 'Tắt âm'}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
