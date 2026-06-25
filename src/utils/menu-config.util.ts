import { menuConfig } from '@/constants';
import type { MenuItem } from '@/types';
import { validatePermission } from '@/utils/validate-permission.util';

/**
 * @param userPermissions The list of permission codes the user has
 */
export const getFirstActiveRoute = (userPermissions: string[]): string => {
  /**
   * @param menu The menu items to filter
   */
  const filterMenuByPermission = (menu: MenuItem[]): MenuItem[] => {
    return menu.flatMap((item) => {
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

      if (!allowed && (!children || children.length === 0)) return [];

      return [{ ...item, children }];
    });
  };

  const filteredMenu = filterMenuByPermission(menuConfig);

  /**
   * @param menu The menu items to search
   */
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
