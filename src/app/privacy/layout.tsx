import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách'
};

export default function ContactLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
