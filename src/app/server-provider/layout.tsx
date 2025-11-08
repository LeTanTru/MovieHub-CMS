import { SidebarLayout } from '@/components/layout';

export default function ServerProviderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
