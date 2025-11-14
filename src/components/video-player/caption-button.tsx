'use client';

import {
  CaptionButton as OriginCaptionButton,
  isTrackCaptionKind,
  Tooltip,
  useMediaState
} from '@vidstack/react';
import {
  ClosedCaptionsIcon,
  ClosedCaptionsOnIcon
} from '@vidstack/react/icons';

export default function CaptionButton() {
  const track = useMediaState('textTrack'),
    isOn = track && isTrackCaptionKind(track);
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <OriginCaptionButton className='vds-button'>
          {isOn ? (
            <ClosedCaptionsOnIcon className='vds-icon' />
          ) : (
            <ClosedCaptionsIcon className='vds-icon' />
          )}
        </OriginCaptionButton>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top center'>
        {isOn ? 'Tắt phụ đề' : 'Bật phụ đề'}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
