'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import DropdownAvatar from '@/components/navbar/dropdown-avatar';

const Navbar = () => {
  return (
    <nav className='relative z-10 flex h-16 items-center justify-between bg-white p-3 shadow-[0px_0px_10px_5px] shadow-gray-200'>
      {/* LEFT */}
      <SidebarTrigger className='[&>svg]:stroke-sidebar cursor-pointer transition-all duration-200 ease-linear hover:bg-transparent [&>svg]:size-6!' />
      {/* RIGHT */}
      <div className='flex gap-x-8'>
        <DropdownAvatar />
      </div>
    </nav>
  );
};

export default Navbar;
