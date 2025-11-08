import React from 'react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-[100vh] w-full items-center justify-center overflow-hidden'>
      {children}
    </div>
  );
}
