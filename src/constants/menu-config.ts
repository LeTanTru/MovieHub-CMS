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
      },
      {
        key: 'customer-list',
        label: 'Khách hàng',
        path: route.customer.getList.path,
        permissionCode: [apiConfig.customer.getList.permissionCode]
      }
    ]
  },
  {
    key: 'business-management',
    label: 'Quản lý doanh nghiệp',
    icon: AiOutlineUser,
    permissionCode: [apiConfig.business.getList.permissionCode],
    children: [
      {
        key: 'business-list',
        label: 'Doanh nghiệp',
        path: route.business.getList.path,
        permissionCode: [apiConfig.business.getList.permissionCode]
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
      },
      {
        key: 'server-provider',
        label: 'Máy chủ',
        path: route.serverProvider.getList.path,
        permissionCode: [apiConfig.group.getList.permissionCode]
      }
    ]
  }
];

export default menuConfig;
