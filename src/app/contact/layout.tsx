import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Liên hệ'
};

type ContactLayoutProps = { children: ReactNode };

export default function ContactLayout({ children }: ContactLayoutProps) {
  return <>{children}</>;
}
