import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Liên hệ'
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
