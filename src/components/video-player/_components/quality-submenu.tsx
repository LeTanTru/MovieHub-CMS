'use client';

import { SettingsMenuIcon } from '@vidstack/react/icons';
import { Menu, useVideoQualityOptions } from '@vidstack/react';
import { submenuClass } from './styles';
import { MenuRadio } from './menu-radio';
import { SubmenuButton } from './submenu-button';

export function QualitySubmenu() {
  const options = useVideoQualityOptions({ auto: true, sort: 'descending' });

  const currentQualityHeight = options.selectedQuality?.height;
  const hint =
    options.selectedValue !== 'auto' && currentQualityHeight
      ? `${currentQualityHeight}p`
      : `${'Tự động'}${currentQualityHeight ? ` (${currentQualityHeight}p)` : ''}`;

  return (
    <Menu.Root>
      <SubmenuButton label='Chất lượng' hint={hint} icon={SettingsMenuIcon} />

      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='flex w-full flex-col'
          value={options.selectedValue}
        >
          {options.map(
            ({ quality: _, label, value, bitrateText: __, select }) => (
              <MenuRadio value={value} onSelect={select} key={value}>
                {label}
              </MenuRadio>
            )
          )}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
