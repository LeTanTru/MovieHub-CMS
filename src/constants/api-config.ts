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
      baseUrl: `${AppConstants.tenantApiUrl}/v1/employee/login`,
      method: 'POST',
      headers: baseHeader,
      isRequiredTenantId: true
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
  category: {
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/category/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CA_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/category/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CA_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/category/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'CA_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/category/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'CA_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/category/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CA_U'
    }
  },
  comment: {
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/comment/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CA_L'
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
  movie: {
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie/create`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_U'
    }
  },
  movieItem: {
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_I_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_I_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/create`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_I_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_I_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_I_U'
    },
    updateOrdering: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-item/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_I_U'
    }
  },
  moviePerson: {
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-person/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_P_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-person/create`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_P_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-person/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_P_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-person/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_P_U'
    },
    updateOrdering: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/movie-person/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_P_U'
    }
  },
  person: {
    autoComplete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/admin/auto-complete`,
      method: 'GET',
      headers: baseHeader
    },
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PSN_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PSN_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/create`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PSN_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'PSN_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/person/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'PSN_U'
    }
  },
  review: {
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/review/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'REV_L'
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
  file: {
    upload: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/upload`,
      method: 'POST',
      headers: multipartHeader,
      permissionCode: 'FILE_U',
      isUpload: true,
      isRequiredTenantId: true
    },
    uploadVideo: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/upload-video`,
      method: 'POST',
      headers: multipartHeader,
      permissionCode: 'FILE_U_V',
      isUpload: true,
      isRequiredTenantId: true
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
  },
  sidebar: {
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SBD_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SBD_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/create`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SBD_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'SBD_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'SBD_U'
    },
    updateOrdering: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/sidebar/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'SBD_U'
    }
  },
  videoLibary: {
    getById: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/video-library/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'VID_L_V'
    },
    getList: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/video-library/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'VID_L_L'
    },
    create: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/video-library/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'VID_L_C'
    },
    delete: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/video-library/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'VID_L_D'
    },
    update: {
      baseUrl: `${AppConstants.tenantApiUrl}/v1/video-library/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'VID_L_U'
    }
  }
});

export default apiConfig;
