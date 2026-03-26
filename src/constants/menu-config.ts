import apiConfig from '@/constants/api-config';
import { COLLECTION_TYPE_TOPIC } from '@/constants/constant';
import { route } from '@/routes';
import type { MenuItem } from '@/types';
import { Film, LucideLayoutGrid, Settings, UserRound } from 'lucide-react';

const menuConfig: MenuItem[] = [
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
        key: 'admin-list',
        label: 'Quản trị viên',
        path: route.admin.getList.path,
        permissionCode: [apiConfig.account.getList.permissionCode]
      },
      {
        key: 'employee-list',
        label: 'Nhân viên',
        path: route.employee.getList.path,
        permissionCode: [apiConfig.employee.getList.permissionCode]
      },
      {
        key: 'user-list',
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
        key: 'category-list',
        label: 'Thể loại',
        path: route.category.getList.path,
        permissionCode: [apiConfig.category.getList.permissionCode]
      },
      {
        key: 'video-library-list',
        label: 'Video',
        path: route.videoLibrary.getList.path,
        permissionCode: [apiConfig.videoLibrary.getList.permissionCode]
      },
      {
        key: 'person-list',
        label: 'Diễn viên & Đạo diễn',
        path: route.person.getList.path,
        permissionCode: [apiConfig.person.getList.permissionCode]
      },
      {
        key: 'movie-list',
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
        key: 'sidebar-movie-list',
        label: 'Phim hot',
        path: route.sidebar.getList.path,
        permissionCode: [apiConfig.sidebar.getList.permissionCode]
      },
      {
        key: 'style-list',
        label: 'Thiết kế',
        path: route.style.getList.path,
        permissionCode: [apiConfig.style.getList.permissionCode]
      },
      {
        key: 'collection-list',
        label: 'Bộ sưu tập',
        path: route.collection.getList.path,
        permissionCode: [apiConfig.collection.getList.permissionCode],
        query: { type: COLLECTION_TYPE_TOPIC }
      }
    ]
  },
  {
    key: 'system-management',
    label: 'Quản lý hệ thống',
    icon: Settings,
    permissionCode: [
      apiConfig.group.getList.permissionCode,
      apiConfig.appVersion.getList.permissionCode
    ],
    children: [
      {
        key: 'app-version-list',
        label: 'Phiên bản ứng dụng',
        path: route.appVersion.getList.path,
        permissionCode: [apiConfig.appVersion.getList.permissionCode]
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

export default menuConfig;
