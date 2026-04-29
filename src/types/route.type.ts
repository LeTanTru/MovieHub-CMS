export type RouteItem = {
  path?: string;
  auth?: boolean;
  permissionCode?: string[];
  [key: string]: RouteItem | string[] | boolean | string | number | undefined;
};

export type RouteConfig = Record<string, RouteItem>;
