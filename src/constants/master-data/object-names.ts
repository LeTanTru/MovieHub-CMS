export const objectNames = {
  ACCOUNT: 'tài khoản',
  ADMIN: 'quản trị viên',
  APP_VERSION: 'phiên bản ứng dụng',
  CATEGORY: 'thể loại',
  COLLECTION: 'bộ sưu tập',
  COMMENT: 'bình luận',
  EMPLOYEE: 'nhân viên',
  GROUP_PERMISSION: 'nhóm quyền',
  GROUP: 'vai trò',
  MOVIE_ITEM: 'phần',
  MOVIE: 'phim',
  NOTIFICATION: 'thông báo',
  PERMISSION: 'quyền',
  PERSON_ACTOR: 'diễn viên',
  PERSON_DIRECTOR: 'đạo diễn',
  PROFILE: 'hồ sơ',
  REVIEW: 'đánh giá',
  SERVER_CONFIG: 'cấu hình máy chủ',
  SETTING: 'cài đặt',
  SIDEBAR: 'phim',
  STYLE: 'thiết kế',
  SUBTITLE: 'phụ đề',
  USER_REPORT: 'báo cáo vi phạm',
  USER: 'người dùng',
  VIDEO: 'video'
} as const;

export type ObjectNameKey = keyof typeof objectNames;
