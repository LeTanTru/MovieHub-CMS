export const adminQueryKeys = {
  ADMIN: 'admin',
  CHANGE_ADMIN_STATUS: 'change-admin-status'
};

export const authQueryKeys = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REFRESH_TOKEN: 'refresh-token',
  SESSION: 'session'
};

export const categoryQueryKeys = {
  CATEGORY_LIST: 'category-list',
  CATEGORY: 'category'
};

export const collectionQueryKeys = {
  COLLECTION_ITEM_LIST: 'collection-item-list',
  COLLECTION_ITEM: 'collection-item',
  COLLECTION_LIST: 'collection-list',
  COLLECTION: 'collection'
};

export const commentQueryKeys = {
  CHANGE_COMMENT_STATUS: 'change-status-comment',
  COMMENT_INFINITE: 'comment-infinite',
  COMMENT: 'comment',
  PIN_COMMENT: 'pin-comment',
  UPDATE_COMMENT_TOXIC_SPANS: 'update-comment-toxic-spans',
  VOTE_COMMENT: 'vote-comment'
};

export const employeeQueryKeys = {
  CHANGE_EMPLOYEE_STATUS: 'change-employee-status',
  EMPLOYEE_PROFILE: 'employee-profile',
  EMPLOYEE: 'employee'
};

export const fileQueryKeys = {
  DELETE_FILE: 'delete-file',
  FILE: 'file',
  UPLOAD_AVATAR_FILE: 'upload-avatar-file',
  UPLOAD_FILE: 'upload-file',
  UPLOAD_LOGO_FILE: 'upload-logo-file',
  UPLOAD_SUBTITLE_FILE: 'upload-subtitle-file'
};

export const groupQueryKeys = {
  GROUP_LIST: 'group-list',
  GROUP_PERMISSION_LIST: 'group-permission-list',
  GROUP_PERMISSION: 'group-permission',
  GROUP: 'group'
};

export const movieQueryKeys = {
  MARK_LATEST_MOVIE_ITEM: 'mark-latest-movie-item',
  MOVIE_ITEM_LIST: 'movie-item-list',
  MOVIE_ITEM: 'movie-item',
  MOVIE: 'movie'
};

export const moviePersonQueryKeys = {
  CREATE_MOVIE_PERSON: 'create-movie-person',
  MOVIE_PERSON_LIST: 'movie-person-list',
  MOVIE_PERSON: 'movie-person',
  UPDATE_MOVIE_PERSON: 'update-movie-person'
};

export const notificationQueryKeys = {
  DELETE_ALL_NOTIFICATION: 'delete-all-notification',
  NOTIFICATION_INFINITE: 'notification-infinite',
  NOTIFICATION: 'notification',
  READ_ALL_NOTIFICATION: 'read-all-notification',
  UNREAD_NOTIFICATION_COUNT: 'unread-notification-count',
  UPDATE_READ_NOTIFICATION: 'update-read-notification'
};

export const permissionQueryKeys = {
  PERMISSION_DELETE: 'permission-delete',
  PERMISSION_LIST: 'permission-list',
  PERMISSION: 'permission'
};

export const personQueryKeys = {
  PERSON: 'person'
};

export const profileQueryKeys = {
  PROFILE: 'profile'
};

export const reviewQueryKeys = {
  CHANGE_REVIEW_STATUS: 'change-status-review',
  REVIEW_INFINITE: 'review-infinite',
  REVIEW: 'review',
  UPDATE_REVIEW_TOXIC_SPANS: 'update-review-toxic-spans'
};

export const serverConfigQueryKeys = {
  SERVER_CONFIG_CHANGE_STATUS: 'server-config-change-status',
  SERVER_CONFIG_LIST: 'server-config-list',
  SERVER_CONFIG: 'server-config'
};

export const settingQueryKeys = {
  APP_VERSION: 'app-version',
  PUBLIC_SETTING: 'public-setting',
  SETTING_AUTO_COMPLETE: 'setting-auto-complete',
  SETTING: 'setting',
  SNS_CONFIG: 'sns-config',
  STYLE: 'style'
};

export const sidebarQueryKeys = {
  SIDEBAR_LIST: 'sidebar-list',
  SIDEBAR: 'sidebar'
};

export const statisticsQueryKeys = {
  MOVIE_DISTRIBUTION_STATISTICS: 'movie-distribution-statistics',
  OVERVIEW_STATISTICS: 'overview-statistics',
  TOP_MOVIES_STATISTICS: 'top-movies-statistics'
};

export const userQueryKeys = {
  CHANGE_USER_STATUS: 'change-user-status',
  USER_REPORT: 'user-report',
  USER: 'user'
};

export const videoLibraryQueryKeys = {
  PROCESS_AUDIO_VIDEO_LIBRARY: 'process-audio-video-library',
  RETRY_PROCESS_VIDEO_LIBRARY: 'retry-process-video-library',
  VIDEO_LIBRARY_LIST: 'video-library-list',
  VIDEO_LIBRARY_SUBTITLE_LIST: 'video-library-subtitle-list',
  VIDEO_LIBRARY_SUBTITLE_TRANSLATE: 'video-library-subtitle-translate',
  VIDEO_LIBRARY_SUBTITLE_CONTENT: 'video-library-subtitle-content',
  VIDEO_LIBRARY_SUBTITLE: 'video-library-subtitle',
  VIDEO_LIBRARY: 'video-library'
};

export const queryKeys = {
  ...adminQueryKeys,
  ...authQueryKeys,
  ...categoryQueryKeys,
  ...collectionQueryKeys,
  ...commentQueryKeys,
  ...employeeQueryKeys,
  ...fileQueryKeys,
  ...groupQueryKeys,
  ...moviePersonQueryKeys,
  ...movieQueryKeys,
  ...notificationQueryKeys,
  ...permissionQueryKeys,
  ...personQueryKeys,
  ...profileQueryKeys,
  ...reviewQueryKeys,
  ...serverConfigQueryKeys,
  ...settingQueryKeys,
  ...sidebarQueryKeys,
  ...statisticsQueryKeys,
  ...userQueryKeys,
  ...videoLibraryQueryKeys
};
