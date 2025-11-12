import AppConstants from '@/constants/app';
import { ApiConfigGroup } from '@/types';

const baseHeader = { 'Content-Type': 'application/json' };
const multipartHeader = { 'Content-Type': 'multipart/form-data' };

const defineApiConfig = <T extends ApiConfigGroup>(config: T) => config;

const apiConfig = defineApiConfig({
  auth: {
    loginManager: {
      baseUrl: `${AppConstants.tenantApiUrl}/api/token`,
      method: 'POST',
      headers: baseHeader
    },
    loginEmployee: {
      baseUrl: `${AppConstants.tenantApiUrl}/employee/login`,
      method: 'POST',
      headers: baseHeader
    }
  },
  account: {
    createAdmin: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/create-admin`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'ACC_C_AD'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'ACC_D'
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_L'
    },
    getProfile: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/profile`,
      method: 'GET',
      headers: baseHeader
    },
    updateAdmin: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/update-admin`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'ACC_U_AD'
    },
    updateProfileAdmin: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/account/update-profile-admin`,
      method: 'PUT',
      headers: baseHeader
    }
  },
  group: {
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_C'
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_L'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_U'
    }
  },
  groupPermission: {
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group-permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_PER_C'
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group-permission/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_PER_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group-permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_PER_L'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/group-permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_PER_U'
    }
  },
  permission: {
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'PER_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/permission/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'PER_D'
    },
    getByIds: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/permission/get/list-by-ids`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_L'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'PER_U'
    }
  },
  file: {
    upload: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/upload`,
      method: 'POST',
      headers: multipartHeader,
      permissionCode: 'FILE_U',
      isUpload: true
    }
  },
  sns: {
    getClientToken: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sns/get-client-token`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GET_SNS_CONFIG'
    },
    sendSignal: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sns/send-signal`,
      method: 'POST',
      headers: baseHeader
    }
  }
});

export default apiConfig;
