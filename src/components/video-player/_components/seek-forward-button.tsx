'use client';

import { SeekButton, Tooltip } from '@vidstack/react';
import { SeekForward10Icon } from '@vidstack/react/icons';

export default function SeekForwardButton() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <SeekButton className='vds-button' seconds={10}>
          <SeekForward10Icon className='vds-icon' />
        </SeekButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        Tiến lên 10 giây
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
