import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type VideoLibraryLayoutProps = {
  children: ReactNode;
};

export default function VideoLibraryLayout({
  children
}: VideoLibraryLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
