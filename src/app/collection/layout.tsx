import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type CollectionLayoutProps = {
  children: ReactNode;
};

export default function CollectionLayout({ children }: CollectionLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
