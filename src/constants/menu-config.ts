import { apiConfig } from '@/constants/api-config';
import {
  COLLECTION_TYPE_TOPIC,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
} from '@/constants/constant';
import { route } from '@/routes';
import type { MenuItem } from '@/types';
import {
  BarChart3,
  Film,
  LucideLayoutGrid,
  Settings,
  UserRound
} from 'lucide-react';

export const menuConfig: MenuItem[] = [
  {
    key: 'user-management',
    label: 'Quản lý người dùng',
    icon: UserRound,
    permissionCode: [
      apiConfig.account.getList.permissionCode,
      apiConfig.employee.getList.permissionCode,
      apiConfig.user.getList.permissionCode
    ],
    children: [
      {
        key: 'admin',
        label: 'Quản trị viên',
        path: route.admin.getList.path,
        permissionCode: [apiConfig.account.getList.permissionCode]
      },
      {
        key: 'employee',
        label: 'Nhân viên',
        path: route.employee.getList.path,
        permissionCode: [apiConfig.employee.getList.permissionCode]
      },
      {
        key: 'user',
        label: 'Người dùng',
        path: route.user.getList.path,
        permissionCode: [apiConfig.user.getList.permissionCode]
      }
    ]
  },
  {
    key: 'movie-management',
    label: 'Quản lý phim',
    icon: Film,
    permissionCode: [
      apiConfig.category.getList.permissionCode,
      apiConfig.videoLibrary.getList.permissionCode,
      apiConfig.person.getList.permissionCode,
      apiConfig.movie.getList.permissionCode
    ],
    children: [
      {
        key: 'category',
        label: 'Thể loại',
        path: route.category.getList.path,
        permissionCode: [apiConfig.category.getList.permissionCode]
      },
      {
        key: 'video-library',
        label: 'Video',
        path: route.videoLibrary.getList.path,
        permissionCode: [apiConfig.videoLibrary.getList.permissionCode],
        query: { sourceType: VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL }
      },
      {
        key: 'person',
        label: 'Diễn viên & Đạo diễn',
        path: route.person.getList.path,
        permissionCode: [apiConfig.person.getList.permissionCode]
      },
      {
        key: 'movie',
        label: 'Phim',
        path: route.movie.getList.path,
        permissionCode: [apiConfig.movie.getList.permissionCode]
      }
    ]
  },
  {
    key: 'ui-management',
    label: 'Quản lý giao diện',
    icon: LucideLayoutGrid,
    permissionCode: [
      apiConfig.sidebar.getList.permissionCode,
      apiConfig.style.getList.permissionCode,
      apiConfig.collection.getList.permissionCode
    ],
    children: [
      {
        key: 'sidebar-movie',
        label: 'Phim hot',
        path: route.sidebar.getList.path,
        permissionCode: [apiConfig.sidebar.getList.permissionCode]
      },
      {
        key: 'style',
        label: 'Thiết kế',
        path: route.style.getList.path,
        permissionCode: [apiConfig.style.getList.permissionCode]
      },
      {
        key: 'collection',
        label: 'Bộ sưu tập',
        path: route.collection.getList.path,
        permissionCode: [apiConfig.collection.getList.permissionCode],
        query: { type: COLLECTION_TYPE_TOPIC }
      }
    ]
  },
  {
    key: 'statistics-management',
    label: 'Quản lý thống kê',
    icon: BarChart3,
    permissionCode: [
      apiConfig.statistics.movieDistribution.permissionCode,
      apiConfig.statistics.overview.permissionCode,
      apiConfig.statistics.topMovies.permissionCode
    ],
    children: [
      {
        key: 'movie-distribution',
        label: 'Phân loại phim',
        path: route.statistics.movieDistribution.path,
        permissionCode: [apiConfig.statistics.movieDistribution.permissionCode]
      },
      {
        key: 'overview',
        label: 'Tổng quan',
        path: route.statistics.overview.path,
        permissionCode: [apiConfig.statistics.overview.permissionCode]
      },
      {
        key: 'top-movies',
        label: 'Top phim',
        path: route.statistics.topMovies.path,
        permissionCode: [apiConfig.statistics.topMovies.permissionCode]
      }
    ]
  },
  {
    key: 'system-management',
    label: 'Quản lý hệ thống',
    icon: Settings,
    permissionCode: [
      apiConfig.group.getList.permissionCode,
      apiConfig.appVersion.getList.permissionCode,
      apiConfig.setting.getList.permissionCode
    ],
    children: [
      {
        key: 'app-version',
        label: 'Phiên bản ứng dụng',
        path: route.appVersion.getList.path,
        permissionCode: [apiConfig.appVersion.getList.permissionCode]
      },
      {
        key: 'server-config',
        label: 'Cấu hình máy chủ',
        path: route.serverConfig.getList.path,
        permissionCode: [apiConfig.serverConfig.getList.permissionCode]
      },
      {
        key: 'setting',
        label: 'Cài đặt',
        path: route.setting.getList.path,
        permissionCode: [apiConfig.setting.getList.permissionCode]
      },
      {
        key: 'role',
        label: 'Vai trò',
        path: route.group.getList.path,
        permissionCode: [apiConfig.group.getList.permissionCode]
      }
    ]
  }
];
