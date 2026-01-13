import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Chính sách'
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
