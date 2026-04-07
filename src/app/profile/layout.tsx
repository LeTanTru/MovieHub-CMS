import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type ProfileLayoutProps = { children: ReactNode };

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
