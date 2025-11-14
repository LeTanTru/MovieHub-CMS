import { SidebarLayout } from '@/components/layout';

export default function VideoLibraryLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
