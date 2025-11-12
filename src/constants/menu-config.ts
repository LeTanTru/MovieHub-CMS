import apiConfig from '@/constants/api-config';
import { route } from '@/routes';
import { MenuItem } from '@/types';
import { Settings } from 'lucide-react';
import { AiOutlineUser } from 'react-icons/ai';

const menuConfig: MenuItem[] = [
  {
    key: 'account-management',
    label: 'Quản lý tài khoản',
    icon: AiOutlineUser,
    permissionCode: [apiConfig.account.getList.permissionCode],
    children: [
      {
        key: 'admin-list',
        label: 'Quản trị viên',
        path: route.admin.getList.path,
        permissionCode: [apiConfig.account.getList.permissionCode]
      }
    ]
  },
  {
    key: 'system-management',
    label: 'Quản lý hệ thống',
    icon: Settings,
    permissionCode: [
      apiConfig.group.getList.permissionCode,
      apiConfig.groupPermission.getList.permissionCode,
      apiConfig.permission.getList.permissionCode
    ],
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
