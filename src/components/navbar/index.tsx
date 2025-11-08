'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import DropdownAvatar from '@/components/navbar/dropdown-avatar';

const Navbar = () => {
  return (
    <nav className='relative flex h-16 items-center justify-between bg-white p-3 shadow-[2px_2px_10px_1px] shadow-slate-200!'>
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
