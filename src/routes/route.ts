import { apiConfig } from '@/constants';

export type RouteItem = {
  path?: string;
  auth?: boolean;
  permissionCode?: string[];
  [key: string]: RouteItem | string[] | boolean | string | undefined;
};

export type RouteConfig = Record<string, RouteItem>;

const defineRoute = <T extends RouteConfig>(routes: T): T => routes;

const route = defineRoute({
  home: {
    path: '/'
  },
  admin: {
    getList: {
      path: '/admin',
      auth: true,
      permissionCode: [apiConfig.account.getList.permissionCode]
    }
  },
  group: {
    getList: {
      path: '/group-permission',
      auth: true,
      permissionCode: [apiConfig.group.getList.permissionCode]
    },
    savePage: {
      path: '/group-permission/:id',
      auth: true,
      permissionCode: [
        apiConfig.group.create.permissionCode,
        apiConfig.group.update.permissionCode
      ]
    }
  },
  login: {
    path: '/login',
    auth: false
  },
  profile: {
    savePage: {
      path: '/profile',
      auth: true
    }
  }
});

export default route;
