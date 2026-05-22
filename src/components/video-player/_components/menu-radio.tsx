import { Menu } from '@vidstack/react';
import {
  RadioButtonIcon,
  RadioButtonSelectedIcon
} from '@vidstack/react/icons';

export const MenuRadio = ({ children, ...props }: Menu.RadioProps) => {
  return (
    <Menu.Radio
      className='ring-media-focus group relative flex w-full cursor-pointer items-center justify-start rounded-sm p-2.5 outline-none select-none data-[focus]:ring-[3px] data-[hocus]:bg-white/10'
      {...props}
    >
      <RadioButtonIcon className='size-4 text-white group-data-[checked]:hidden' />
      <RadioButtonSelectedIcon className='text-media-brand hidden size-4 group-data-[checked]:block' />
      <span className='ml-2'>{children}</span>
    </Menu.Radio>
  );
};
