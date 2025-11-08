import AppConstants from '@/constants/app';
import { ApiConfigGroup } from '@/types';

const baseHeader = { 'Content-Type': 'application/json' };
const multipartHeader = { 'Content-Type': 'multipart/form-data' };

const defineApiConfig = <T extends ApiConfigGroup>(config: T) => config;

const apiConfig = defineApiConfig({
  auth: {
    login: {
      baseUrl: `${AppConstants.apiUrl}/api/token`,
      method: 'POST',
      headers: baseHeader
    }
  },
  account: {
    createAdmin: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/create-admin`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'ACC_C_AD'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'ACC_D'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_L'
    },
    getProfile: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/profile`,
      method: 'GET',
      headers: baseHeader
    },
    updateAdmin: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/update-admin`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'ACC_U_AD'
    },
    updateProfileAdmin: {
      baseUrl: `${AppConstants.apiUrl}/v1/account/update-profile-admin`,
      method: 'PUT',
      headers: baseHeader
    }
  },
  business: {
    checkTenant: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/check-tenant`,
      method: 'GET',
      headers: baseHeader
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'BUS_C'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'BUS_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'BUS_L'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'BUS_U'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'BUS_D'
    },
    configSns: {
      baseUrl: `${AppConstants.apiUrl}/v1/business/config-sns/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SNS_CONFIG'
    }
  },
  customer: {
    changeStatus: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CUS_U'
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'CUS_C'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'CUS_D'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CUS_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CUS_L'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CUS_U'
    }
  },
  dbConfig: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/db-config/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'DB_C'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/customer/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'DB_D'
    },
    getByName: {
      baseUrl: `${AppConstants.apiUrl}/v1/db-config/get_by_name`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'DB_V_NAME'
    },
    getByBusinessId: {
      baseUrl: `${AppConstants.apiUrl}/v1/db-config/get/:businessId`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'DB_V_ST'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/db-config/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'DB_U'
    }
  },
  group: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_C'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_L'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_U'
    }
  },
  groupPermission: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_PER_C'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_PER_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_PER_L'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_PER_U'
    }
  },
  permission: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'PER_C'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'PER_D'
    },
    getByIds: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/get/list-by-ids`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_V'
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_L'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'PER_U'
    }
  },
  serverProvider: {
    autoComplete: {
      baseUrl: `${AppConstants.apiUrl}/v1/server-provider/auto-complete`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SVP_AU'
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/server-provider/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'SVP_C'
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/server-provider/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'SVP_D'
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/server-provider/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'SVP_U'
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/server-provider/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SVP_V'
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
      baseUrl: `${AppConstants.apiUrl}/v1/sns/get-client-token`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GET_SNS_CONFIG'
    },
    sendSignal: {
      baseUrl: `${AppConstants.apiUrl}/v1/sns/send-signal`,
      method: 'POST',
      headers: baseHeader
    }
  }
});

export default apiConfig;
