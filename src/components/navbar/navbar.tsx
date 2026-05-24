'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { ToolTip } from '@/components/form';
import { useShallow } from 'zustand/react/shallow';
import { useSidebarStore } from '@/store';
import { DropdownAvatar } from './dropdown-avatar';
import { DropdownNotification } from './dropdown-notification';

export function Navbar() {
  const { state, setSidebarState } = useSidebarStore(
    useShallow((s) => ({ state: s.state, setSidebarState: s.setSidebarState }))
  );

  return (
    <nav className='bg-background relative z-40 flex h-16 items-center justify-between p-3 shadow-[0px_0px_10px_5px] shadow-gray-200'>
      {/* LEFT */}
      <ToolTip
        title={
          <div className='flex gap-x-1'>
            <span className='inline-block rounded bg-gray-300 px-1 text-black'>
              Ctrl
            </span>
            <span className='inline-block rounded bg-gray-300 px-2 text-black'>
              B
            </span>
          </div>
        }
      >
        <SidebarTrigger
          className='[&>svg]:stroke-foreground cursor-pointer transition-all duration-200 ease-linear hover:bg-transparent focus-visible:ring-0 [&>svg]:size-6!'
          onClick={() =>
            setSidebarState(state === 'expanded' ? 'collapsed' : 'expanded')
          }
        />
      </ToolTip>
      {/* RIGHT */}
      <div className='flex items-center gap-8'>
        {/* <DarkModeToggle /> */}
        <DropdownNotification />
        <DropdownAvatar />
      </div>
    </nav>
  );
}
