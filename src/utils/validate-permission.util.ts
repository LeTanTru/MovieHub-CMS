/**
 * @param value The value to ensure is an array
 */
export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};

/**
 * @param paths The array of paths to clean
 */
export const removePathParams = (paths: string[]) => {
  return ensureArray(paths).map((path) => {
    if (typeof path !== 'string') return path;
    return path.replaceAll(/\/:[a-zA-Z]+/g, '');
  });
};

/**
 * @param value The permission code to sanitize
 */
const removePrefix = (value: string) => value.replace(/^ROLE_/i, '');

/**
 * @param Object The permission config object
 * @param Object.requiredPermissions The list of permissions needed for the route/action
 * @param Object.userPermissions The list of permissions the user holds
 * @param Object.requiredKind The specific kind required
 * @param Object.excludeKind The list of kinds that are excluded
 * @param Object.userKind The user's kind
 * @param Object.path The current path being validated
 * @param Object.separate Whether the save page uses separate permissions for create/edit
 */
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
    if (ensureArray(excludeKind).some((kind) => Number(kind) === userKind))
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
