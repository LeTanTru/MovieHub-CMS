'use client';

import { Activity as BaseActivity } from 'react';

export default function Activity({
  visible,
  children
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <BaseActivity mode={visible ? 'visible' : 'hidden'}>
      {children}
    </BaseActivity>
  );
}
