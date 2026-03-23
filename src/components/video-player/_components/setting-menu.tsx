'use client';

import {
  Menu,
  Tooltip,
  type MenuPlacement,
  type TooltipPlacement
} from '@vidstack/react';
import { SettingsIcon } from '@vidstack/react/icons';
import { buttonClass, menuClass, tooltipClass } from './styles';
import CaptionSubmenu from './caption-submenu';
import QualitySubmenu from './quality-submenu';
import SpeedSubmenu from './speed-submenu';
import VolumeSubmenu from './volume-submenu';

type SettingsProps = {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
};

export default function SettingMenu({
  placement,
  tooltipPlacement
}: SettingsProps) {
  return (
    <Menu.Root className='parent'>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Menu.Button className={buttonClass}>
            <SettingsIcon className='h-8 w-8 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90' />
          </Menu.Button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
          Cài đặt
        </Tooltip.Content>
      </Tooltip.Root>
      <Menu.Content className={menuClass} placement={placement}>
        <CaptionSubmenu />
        <SpeedSubmenu />
        <VolumeSubmenu />
        <QualitySubmenu />
      </Menu.Content>
    </Menu.Root>
  );
}
