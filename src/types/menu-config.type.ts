export type MenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: React.ElementType;
  badge?: string | number;
  children?: MenuItem[];
  permissionCode?: string[];
  query?: Record<string, any>;
};
