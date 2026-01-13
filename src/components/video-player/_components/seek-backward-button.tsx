'use client';

import { SeekButton, Tooltip } from '@vidstack/react';
import { SeekBackward10Icon } from '@vidstack/react/icons';

export default function SeekBackwardButton() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <SeekButton className='vds-button' seconds={-10}>
          <SeekBackward10Icon className='vds-icon' />
        </SeekButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        Quay lại 10 giây
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
