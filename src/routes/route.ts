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
  customer: {
    getList: {
      path: '/customer',
      auth: true,
      permissionCode: [apiConfig.account.getList.permissionCode]
    },
    savePage: {
      path: '/customer/:id',
      auth: true,
      permissionCode: [
        apiConfig.customer.create.permissionCode,
        apiConfig.customer.update.permissionCode
      ]
    },
    business: {
      getList: {
        path: '/customer/:id/business',
        auth: true,
        permissionCode: [apiConfig.business.getList.permissionCode]
      },
      savePage: {
        path: '/customer/:id/business/:id',
        auth: true,
        permissionCode: [
          apiConfig.business.create.permissionCode,
          apiConfig.business.update.permissionCode
        ]
      }
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
  serverProvider: {
    getList: {
      path: '/server-provider',
      auth: true,
      permissionCode: [apiConfig.serverProvider.autoComplete.permissionCode]
    },
    savePage: {
      path: '/server-provider/:id',
      auth: true,
      permissionCode: [
        apiConfig.serverProvider.create.permissionCode,
        apiConfig.serverProvider.update.permissionCode
      ]
    }
  },
  business: {
    getList: {
      path: '/business',
      auth: true,
      permissionCode: [apiConfig.business.getList.permissionCode]
    },
    savePage: {
      path: '/business/:id',
      auth: true,
      permissionCode: [
        apiConfig.business.create.permissionCode,
        apiConfig.business.update.permissionCode
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
