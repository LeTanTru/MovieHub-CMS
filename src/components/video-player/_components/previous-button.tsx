'use client';

import { Tooltip } from '@vidstack/react';
import { PreviousIcon } from '@vidstack/react/icons';

type PreviousButtonProps = {
  onClick: () => void;
};

export function PreviousButton({ onClick }: PreviousButtonProps) {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          className='vds-button'
          aria-label='Previous video'
          onClick={handleClick}
          onTouchEnd={handleClick}
          style={{ touchAction: 'manipulation' }}
        >
          <PreviousIcon size={32} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className='vds-tooltip-content' placement='top'>
        Tập trước
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
