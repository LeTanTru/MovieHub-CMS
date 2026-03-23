import AppConstants from '@/constants/app';
import type { ApiConfigGroup } from '@/types';

const baseHeader = { 'Content-Type': 'application/json' };
const multipartHeader = {
  'Content-Type': 'multipart/form-data'
};

const defineApiConfig = <T extends ApiConfigGroup>(config: T) => config;

const apiConfig = defineApiConfig({
  auth: {
    token: {
      baseUrl: `${AppConstants.authApiUrl}/api/token`,
      method: 'POST',
      headers: baseHeader,
      isRequiredXClientType: true
    },
    logout: {
      baseUrl: `${AppConstants.authApiUrl}/v1/auth/logout`,
      method: 'POST',
      headers: baseHeader,
      isRequiredXClientType: true
    },
    refreshToken: {
      baseUrl: `${AppConstants.authApiUrl}/api/token`,
      method: 'POST',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  account: {
    createAdmin: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/create-admin`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'ACC_C'
    },
    delete: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'ACC_D'
    },
    getById: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_V'
    },
    getList: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'ACC_L'
    },
    getProfile: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/profile`,
      method: 'GET',
      headers: baseHeader
    },
    updateAdmin: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/update-admin`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'ACC_U'
    },
    updateProfile: {
      baseUrl: `${AppConstants.authApiUrl}/v1/account/update-profile`,
      method: 'PUT',
      headers: baseHeader
    }
  },
  category: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/category/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CA_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/category/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CA_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/category/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'CA_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/category/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'CA_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/category/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CA_U',
      isRequiredXClientType: true
    }
  },
  comment: {
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'CMT_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'CMT_C',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CMT_U',
      isRequiredXClientType: true
    },
    changeStatus: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CMT_U',
      isRequiredXClientType: true
    },
    pin: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/pin`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CMT_PIN',
      isRequiredXClientType: true
    },
    vote: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/vote`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'CMT_VOTE',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'CMT_D',
      isRequiredXClientType: true
    },
    voteList: {
      baseUrl: `${AppConstants.apiUrl}/v1/comment/vote-list/:movieId`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  employee: {
    changeStatus: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'EM_U',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'EM_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'EM_D',
      isRequiredXClientType: true
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'EM_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'EM_L',
      isRequiredXClientType: true
    },
    getProfile: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/profile`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'EM_U',
      isRequiredXClientType: true
    },
    updateProfile: {
      baseUrl: `${AppConstants.apiUrl}/v1/employee/update-profile`,
      method: 'PUT',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  group: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_C',
      isRequiredXClientType: true
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_L',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/group/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_U',
      isRequiredXClientType: true
    }
  },
  groupPermission: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'GR_P_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'GR_P_D',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'GR_P_L',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_P_U',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/group-permission/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'GR_P_U',
      isRequiredXClientType: true
    }
  },
  permission: {
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'PER_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'PER_D',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_L',
      isRequiredXClientType: true
    },
    getListByIds: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/list-by-ids`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PER_L',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/permission/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'PER_U',
      isRequiredXClientType: true
    }
  },
  movie: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'MOV_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_U',
      isRequiredXClientType: true
    },
    collectionFilter: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie/collection-filter/:collectionId`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_L',
      isRequiredXClientType: true
    }
  },
  movieItem: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_I_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_I_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'MOV_I_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_I_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_I_U',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-item/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_I_U',
      isRequiredXClientType: true
    }
  },
  moviePerson: {
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-person/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'MOV_P_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-person/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'MOV_P_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-person/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'MOV_P_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-person/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_P_U',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/movie-person/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'MOV_P_U',
      isRequiredXClientType: true
    }
  },
  person: {
    autoComplete: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/admin/auto-complete`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PSN_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'PSN_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'PSN_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'PSN_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/person/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'PSN_U',
      isRequiredXClientType: true
    }
  },
  review: {
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/review/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'REV_L',
      isRequiredXClientType: true
    },
    changeStatus: {
      baseUrl: `${AppConstants.apiUrl}/v1/review/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'REV_C_S',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/review/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'REV_D',
      isRequiredXClientType: true
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/review/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'REV_V',
      isRequiredXClientType: true
    },
    voteList: {
      baseUrl: `${AppConstants.apiUrl}/v1/review/vote-list/:movieId`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  user: {
    changeStatus: {
      baseUrl: `${AppConstants.apiUrl}/v1/user/change-status`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'USR_U',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/user/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'USR_D',
      isRequiredXClientType: true
    },
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/user/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'USR_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/user/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'USR_L',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/user/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'USR_U',
      isRequiredXClientType: true
    }
  },
  file: {
    upload: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/upload`,
      method: 'POST',
      headers: multipartHeader,
      permissionCode: 'FILE_U',
      isUpload: true
    },
    uploadVideo: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/upload-video`,
      method: 'POST',
      headers: multipartHeader,
      permissionCode: 'FILE_U_V',
      isUpload: true
    },
    delete: {
      baseUrl: `${AppConstants.mediaUrl}/v1/file/delete-file`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'FILE_U_D'
    }
  },
  sns: {
    sendSignal: {
      baseUrl: `${AppConstants.apiUrl}/v1/sns/send-signal`,
      method: 'POST',
      headers: baseHeader
    }
  },
  sidebar: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SDB_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'SDB_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'SDB_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'SDB_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'SDB_U',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/sidebar/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'SBD_U',
      isRequiredXClientType: true
    }
  },
  videoLibrary: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'VID_L_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'VID_L_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'VID_L_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'VID_L_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'VID_L_U',
      isRequiredXClientType: true
    },
    autoComplete: {
      baseUrl: `${AppConstants.apiUrl}/v1/video-library/auto-complete`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  appVersion: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/app-version/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'APP_V_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/app-version/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'APP_V_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/app-version/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'APP_V_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/app-version/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'APP_V_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/app-version/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'APP_V_U',
      isRequiredXClientType: true
    }
  },
  style: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'STL_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'STL_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'STL_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'STL_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'STL_U',
      isRequiredXClientType: true
    },
    autoComplete: {
      baseUrl: `${AppConstants.apiUrl}/v1/style/auto-complete`,
      method: 'GET',
      headers: baseHeader,
      isRequiredXClientType: true
    }
  },
  collection: {
    getById: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/admin/get/:id`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'COL_V',
      isRequiredXClientType: true
    },
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'COL_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'COL_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'COL_D',
      isRequiredXClientType: true
    },
    update: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/update`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'COL_U',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'COL_U',
      isRequiredXClientType: true
    }
  },
  collectionItem: {
    getList: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection-item/admin/list`,
      method: 'GET',
      headers: baseHeader,
      permissionCode: 'COL_I_L',
      isRequiredXClientType: true
    },
    create: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection-item/create`,
      method: 'POST',
      headers: baseHeader,
      permissionCode: 'COL_I_C',
      isRequiredXClientType: true
    },
    delete: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection-item/delete/:id`,
      method: 'DELETE',
      headers: baseHeader,
      permissionCode: 'COL_I_D',
      isRequiredXClientType: true
    },
    updateOrdering: {
      baseUrl: `${AppConstants.apiUrl}/v1/collection-item/update-ordering`,
      method: 'PUT',
      headers: baseHeader,
      permissionCode: 'COL_I_U',
      isRequiredXClientType: true
    }
  }
});

export default apiConfig;
