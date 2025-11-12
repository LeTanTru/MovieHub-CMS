import AppConstants from '@/constants/app';
import { ApiConfigGroup } from '@/types';

const baseHeader = { 'Content-Type': 'application/json' };
const multipartHeader = { 'Content-Type': 'multipart/form-data' };

const defineApiConfig = <T extends ApiConfigGroup>(config: T) => config;

const apiConfig = defineApiConfig({
  auth: {
    loginManager: {
      baseUrl: `${AppConstants.metaApiUrl}/api/token`,
      method: 'POST',
      headers: baseHeader
    },
    loginEmployee: {
      baseUrl: `${AppConstants.tenantApiUrl}/employee/login`,
      method: 'POST',
      headers: baseHeader
    }
  },
  customer: {
    getProfile: {
      baseUrl: `${AppConstants.metaApiUrl}/v1/customer/profile`,
      method: 'GET',
      headers: baseHeader
    },
    updateProfile: {
      baseUrl: `${AppConstants.metaApiUrl}/v1/customer/update-profile`,
      method: 'PUT',
      headers: baseHeader
    }
  },
  employee: {
    changeStatus: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'EM_U'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'EM_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'EM_D'
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'EM_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'EM_L'
    },
    getProfile: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/profile`,
      method: 'GET',
      headers: baseHeader
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'EM_U'
    },
    updateProfile: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/update-profile`,
      method: 'GET',
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
  user: {
    changeStatus: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/user/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'USR_U'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/user/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'USR_D'
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/user/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'USR_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/user/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'USR_L'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/user/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'USR_U'
    }
  },
  permission: {
    getList: {
      baseUrl: `${AppConstants.metaApiUrl}/v1/permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_L'
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
