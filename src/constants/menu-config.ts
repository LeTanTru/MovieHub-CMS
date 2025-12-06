import apiConfig from '@/constants/api-config';
import { route } from '@/routes';
import { MenuItem } from '@/types';
import { LucideLayoutGrid, Settings } from 'lucide-react';
import { AiOutlineUser } from 'react-icons/ai';
import { RiMovie2Fill } from 'react-icons/ri';

const menuConfig: MenuItem[] = [
  {
    key: 'user-management',
    label: 'Quản lý người dùng',
    icon: AiOutlineUser,
    permissionCode: [apiConfig.employee.getList.permissionCode],
    children: [
      {
        key: 'employee-list',
        label: 'Nhân viên',
        path: route.employee.getList.path,
        permissionCode: [apiConfig.employee.getList.permissionCode]
      },
      {
        key: 'audience-list',
        label: 'Khán giả',
        path: route.audience.getList.path,
        permissionCode: [apiConfig.user.getList.permissionCode]
      }
    ]
  },
  {
    key: 'movie-management',
    label: 'Quản lý phim',
    icon: RiMovie2Fill,
    permissionCode: [
      apiConfig.category.getList.permissionCode,
      apiConfig.videoLibrary.getList.permissionCode,
      apiConfig.person.getList.permissionCode,
      apiConfig.movie.getList.permissionCode
    ],
    children: [
      {
        key: 'category-list',
        label: 'Danh mục phim',
        path: route.category.getList.path,
        permissionCode: [apiConfig.category.getList.permissionCode]
      },
      {
        key: 'video-library-list',
        label: 'Thư viện video',
        path: route.videoLibrary.getList.path,
        permissionCode: [apiConfig.videoLibrary.getList.permissionCode]
      },
      {
        key: 'person-list',
        label: 'Diễn viên & đạo diễn',
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
        label: 'Phim nổi bật',
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
        permissionCode: [apiConfig.collection.getList.permissionCode]
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
        key: 'permission',
        label: 'Quyền',
        path: route.group.getList.path,
        permissionCode: [apiConfig.group.getList.permissionCode]
      }
    ]
  }
];

export default menuConfig;
