'use client';

import Navbar from '@/components/navbar';
import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSidebarStore } from '@/store';
import type { CSSProperties, ReactNode } from 'react';

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const state = useSidebarStore((s) => s.state);
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '18.75rem',
          '--sidebar-width-icon': '5rem'
        } as CSSProperties
      }
      defaultOpen={state === 'expanded'}
    >
      <AppSidebar />
      <div className='w-full overflow-y-hidden'>
        <Navbar />
        {children}
      </div>
    </SidebarProvider>
  );
}
