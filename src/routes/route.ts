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
  employee: {
    getList: {
      path: '/employee',
      auth: true,
      permissionCode: [apiConfig.employee.getList.permissionCode]
    },
    savePage: {
      path: '/employee/:id',
      auth: true,
      permissionCode: [
        apiConfig.employee.create.permissionCode,
        apiConfig.employee.update.permissionCode
      ],
      separate: true
    }
  },
  audience: {
    getList: {
      path: '/audience',
      auth: true,
      permissionCode: [apiConfig.user.getList.permissionCode]
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
  },
  category: {
    getList: {
      path: '/category',
      auth: true,
      permissionCode: [apiConfig.category.getList.permissionCode]
    },
    savePage: {
      path: '/category/:id',
      auth: true,
      permissionCode: [
        apiConfig.category.create.permissionCode,
        apiConfig.category.update.permissionCode
      ],
      separate: true
    }
  },
  person: {
    getList: {
      path: '/person',
      auth: true,
      permissionCode: [apiConfig.person.getList.permissionCode]
    },
    savePage: {
      path: '/person/:id',
      auth: true,
      permissionCode: [
        apiConfig.person.create.permissionCode,
        apiConfig.person.update.permissionCode
      ],
      separate: true
    }
  },
  videoLibrary: {
    getList: {
      path: '/video-library',
      auth: true,
      permissionCode: [apiConfig.videoLibary.getList.permissionCode]
    },
    savePage: {
      path: '/video-library/:id',
      auth: true,
      permissionCode: [
        apiConfig.videoLibary.create.permissionCode,
        apiConfig.videoLibary.update.permissionCode
      ],
      separate: true
    }
  },
  movie: {
    getList: {
      path: '/movie',
      auth: true,
      permissionCode: [apiConfig.movie.getList.permissionCode]
    },
    savePage: {
      path: '/movie/:id',
      auth: true,
      permissionCode: [
        apiConfig.movie.create.permissionCode,
        apiConfig.movie.update.permissionCode
      ],
      separate: true
    }
  },
  movieItem: {
    getList: {
      path: '/movie/:id/movie-item',
      auth: true,
      permissionCode: [apiConfig.movieItem.getList.permissionCode]
    },
    savePage: {
      path: '/movie/:id/movie-item/:movieItemId',
      auth: true,
      permissionCode: [
        apiConfig.movieItem.create.permissionCode,
        apiConfig.movieItem.update.permissionCode
      ],
      separate: true
    }
  },
  moviePerson: {
    getList: {
      path: '/movie/:id/movie-person',
      auth: true,
      permissionCode: [apiConfig.moviePerson.getList.permissionCode]
    }
  },
  sidebar: {
    getList: {
      path: '/sidebar',
      auth: true,
      permissionCode: [apiConfig.sidebar.getList.permissionCode]
    },
    savePage: {
      path: '/sidebar/:id',
      auth: true,
      permissionCode: [
        apiConfig.sidebar.create.permissionCode,
        apiConfig.sidebar.update.permissionCode
      ],
      separate: true
    }
  },
  appVersion: {
    getList: {
      path: '/app-version',
      auth: true,
      permissionCode: [apiConfig.appVersion.getList.permissionCode]
    },
    savePage: {
      path: '/app-version/:id',
      auth: true,
      permissionCode: [
        apiConfig.appVersion.create.permissionCode,
        apiConfig.appVersion.update.permissionCode
      ],
      separate: true
    }
  }
});

export default route;
