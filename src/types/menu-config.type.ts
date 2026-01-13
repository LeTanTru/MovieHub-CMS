import type { ElementType } from 'react';

export type MenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ElementType;
  badge?: string | number;
  children?: MenuItem[];
  permissionCode?: string[];
  query?: Record<string, any>;
};
