import apiConfig from '@/constants/api-config';
import { route } from '@/routes';
import { MenuItem } from '@/types';
import { Settings } from 'lucide-react';
import { AiOutlineUser } from 'react-icons/ai';

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
    icon: AiOutlineUser,
    permissionCode: [apiConfig.employee.getList.permissionCode],
    children: [
      {
        key: 'category-list',
        label: 'Danh mục phim',
        path: route.category.getList.path,
        permissionCode: [apiConfig.user.getList.permissionCode],
        badge: 1
      }
    ]
  },
  {
    key: 'system-management',
    label: 'Quản lý hệ thống',
    icon: Settings,
    permissionCode: [apiConfig.group.getList.permissionCode],
    children: [
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
