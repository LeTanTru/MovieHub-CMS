import { menuConfig } from '@/constants';
import type { MenuItem } from '@/types';
import { validatePermission } from '@/utils/validate-permission.util';

export const getFirstActiveRoute = (userPermissions: string[]): string => {
  const filterMenuByPermission = (menu: MenuItem[]): MenuItem[] => {
    return menu
      .map((item) => {
        let children: MenuItem[] | undefined;
        if (item.children) {
          children = filterMenuByPermission(item.children);
        }

        const allowed =
          !item.permissionCode ||
          validatePermission({
            requiredPermissions: item.permissionCode,
            userPermissions
          });

        if (!allowed && (!children || children.length === 0)) return null;

        return { ...item, children };
      })
      .filter(Boolean) as MenuItem[];
  };

  const filteredMenu = filterMenuByPermission(menuConfig);

  const findFirstPath = (menu: MenuItem[]): MenuItem | null => {
    for (const item of menu) {
      if (item.path) return item;
      if (item.children) {
        const child = findFirstPath(item.children);
        if (child) return child;
      }
    }
    return null;
  };

  return findFirstPath(filteredMenu)?.path ?? '';
};
