import type { ReactNode } from 'react';

export type BreadcrumbType = {
  label: string;
  href?: string;
};

export type ReusableBreadcrumbProps = {
  items: BreadcrumbType[];
  separator?: ReactNode;
};
