'use client';

import { Activity as BaseActivity, type ReactNode } from 'react';

type ActivityProps = {
  visible: boolean;
  children: ReactNode;
};

export const Activity = ({ visible, children }: ActivityProps) => {
  return (
    <BaseActivity mode={visible ? 'visible' : 'hidden'}>
      {children}
    </BaseActivity>
  );
};
