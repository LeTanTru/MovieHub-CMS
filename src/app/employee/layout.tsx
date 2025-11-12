import { SidebarLayout } from '@/components/layout';

export default function EmployeeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
