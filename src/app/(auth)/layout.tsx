import type { ReactNode } from 'react';

type AuthLayoutProps = { children: ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      {children}
    </div>
  );
}
