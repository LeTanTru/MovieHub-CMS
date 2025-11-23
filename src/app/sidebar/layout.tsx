import { SidebarLayout as SidebarLayoutComponent } from '@/components/layout';

export default function SidebarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayoutComponent>{children}</SidebarLayoutComponent>;
}
