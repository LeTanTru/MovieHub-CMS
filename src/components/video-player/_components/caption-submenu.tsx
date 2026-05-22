'use client';

import { ClosedCaptionsIcon } from '@vidstack/react/icons';
import { Menu, useCaptionOptions } from '@vidstack/react';
import { submenuClass } from './styles';
import { MenuRadio } from './menu-radio';
import { SubmenuButton } from './submenu-button';
import { getLanguageLabel } from '@/utils';

export function CaptionSubmenu() {
  const options = useCaptionOptions(),
    hint = options.selectedTrack?.label ?? 'Tắt';

  // no caption option, no render
  if (options.length === 1) return null;

  return (
    <Menu.Root>
      <SubmenuButton label='Phụ đề' hint={hint} icon={ClosedCaptionsIcon} />

      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='flex w-full flex-col'
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <MenuRadio value={value} onSelect={select} key={value}>
              {getLanguageLabel(label)}
            </MenuRadio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
