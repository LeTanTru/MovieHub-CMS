import { apiConfig } from '@/constants';

export const ensureArray = (value: any) => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};

export const removePathParams = (paths: string[]) => {
  return ensureArray(paths).map((path) => {
    if (typeof path !== 'string') return path;
    return path.replaceAll(/\/:[a-zA-Z]+/g, '');
  });
};

const removePrefix = (value: string) => value.replace(/^ROLE_/i, '');

export const validatePermission = ({
  requiredPermissions = [],
  userPermissions = [],
  requiredKind,
  excludeKind,
  userKind,
  path,
  separate
}: {
  requiredPermissions: string[];
  userPermissions: string[];
  requiredKind?: number;
  excludeKind?: string[];
  userKind?: number;
  path?: string;
  separate?: boolean;
}) => {
  if (ensureArray(excludeKind).length > 0) {
    if (ensureArray(excludeKind).some((kind) => kind === userKind))
      return false;
  }

  if (requiredKind !== userKind) return false;

  if (requiredPermissions.length === 0) return false;

  let permissionsSavePage = [];

  if (separate && requiredPermissions.length > 0) {
    permissionsSavePage.push(
      path === 'create' ? requiredPermissions[0] : requiredPermissions[1]
    );
  } else {
    permissionsSavePage = requiredPermissions;
  }

  const removePrefixedUserPermissions = userPermissions.map((pCode) =>
    removePrefix(pCode)
  );

  return permissionsSavePage
    .map((item) => removePrefixedUserPermissions.includes(item))
    .every((item) => item);
};
