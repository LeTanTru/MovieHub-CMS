import type { ReactNode } from 'react';

export type BreadcrumbType = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbType[];
  separator?: ReactNode;
};
