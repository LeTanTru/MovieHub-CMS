'use client';

import { Menu } from '@vidstack/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@vidstack/react/icons';
import type { ElementType } from 'react';

type SubmenuButtonProps = {
  label: string;
  hint: string;
  disabled?: boolean;
  icon: ElementType;
};

export default function SubmenuButton({
  label,
  hint,
  icon: Icon,
  disabled
}: SubmenuButtonProps) {
  return (
    <Menu.Button
      className='parent left-0 z-10 flex w-full cursor-pointer items-center justify-start rounded-sm bg-black/60 p-2.5 ring-sky-400 outline-none select-none ring-inset aria-disabled:hidden data-[focus]:ring-[3px] data-[hocus]:bg-white/10 data-[open]:sticky data-[open]:-top-2.5'
      disabled={disabled}
    >
      <ChevronLeftIcon className='parent-data-[open]:block mr-1.5 -ml-0.5 hidden h-[18px] w-[18px]' />
      <Icon className='parent-data-[open]:hidden h-5 w-5' />
      <span className='parent-data-[open]:ml-0 ml-1.5'>{label}</span>
      <span className='ml-auto text-sm text-white/50'>{hint}</span>
      <ChevronRightIcon className='parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50' />
    </Menu.Button>
  );
}
