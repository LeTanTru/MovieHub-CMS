'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import DropdownAvatar from '@/components/navbar/dropdown-avatar';
import { useSidebarStore } from '@/store';
import { DarkModeToggle } from '@/components/dark-mode';

const Navbar = () => {
  const { state, setSidebarState } = useSidebarStore();
  return (
    <nav className='bg-background relative z-10 flex h-16 items-center justify-between p-3 shadow-[0px_0px_10px_5px] shadow-gray-200'>
      {/* LEFT */}
      <SidebarTrigger
        className='[&>svg]:stroke-foreground cursor-pointer transition-all duration-200 ease-linear hover:bg-transparent focus-visible:ring-0 [&>svg]:size-6!'
        onClick={() =>
          setSidebarState(state === 'expanded' ? 'collapsed' : 'expanded')
        }
      />
      {/* RIGHT */}
      <div className='flex gap-x-8'>
        {/* <DarkModeToggle /> */}
        <DropdownAvatar />
      </div>
    </nav>
  );
};

export default Navbar;
