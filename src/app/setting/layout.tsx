import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type SettingLayoutProps = { children: ReactNode };

export default function SettingLayout({ children }: SettingLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
