import {
  AGE_RATING_18_PLUS,
  AGE_RATING_GENERAL,
  AGE_RATING_NC17,
  AGE_RATING_PG,
  AGE_RATING_PG13,
  AGE_RATING_R,
  COLLECTION_TYPE_SECTION,
  COLLECTION_TYPE_TOPIC,
  COLOR_STATUS_ACTIVE,
  COLOR_STATUS_ERROR,
  COLOR_STATUS_PENDING,
  CONVERT_FILE_FAILED,
  DOWNLOAD_TEMP_FILE_FAILED,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  GENERATE_VTT_FAILED,
  GROUP_KIND_ADMIN,
  GROUP_KIND_EMPLOYEE,
  GROUP_KIND_USER,
  MOVIE_IS_FEATURED,
  MOVIE_IS_NOT_FEATURED,
  MOVIE_ITEM_KIND_EPISODE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_SIDEBAR_ACTIVE,
  MOVIE_SIDEBAR_INACTIVE,
  MOVIE_TYPE_SERIES,
  MOVIE_TYPE_SINGLE,
  MOVIE_TYPE_TRAILER,
  NO_SPEECH,
  NOTIFICATION_TYPE_COMMUNITY,
  NOTIFICATION_TYPE_SYSTEM,
  PERSON_KIND_ACTOR,
  PERSON_KIND_DIRECTOR,
  SEND_NOTIFICATION_FOR_ALL_USERS,
  SEND_NOTIFICATION_FOR_INTERESTED_USERS,
  STATUS_ACTIVE,
  STATUS_DELETED,
  STATUS_LOCK,
  STATUS_PENDING,
  UPLOAD_AVATAR,
  UPLOAD_LOGO,
  UPLOAD_SYSTEM,
  VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
  VIDEO_LIBRARY_STATE_COMPLETE,
  VIDEO_LIBRARY_STATE_PROCESSING
} from '@/constants/constant';
import { DistributionGroupBy, OptionType, TopMoviesSortBy } from '@/types';

export const uploadOptions = {
  LOGO: UPLOAD_LOGO,
  AVATAR: UPLOAD_AVATAR,
  SYSTEM: UPLOAD_SYSTEM
};

export const groupKinds = [
  {
    label: 'ADMIN',
    value: GROUP_KIND_ADMIN,
    color: '#EF4444'
  },
  {
    label: 'EMPLOYEE',
    value: GROUP_KIND_EMPLOYEE,
    color: '#3B82F6'
  },
  {
    label: 'USER',
    value: GROUP_KIND_USER,
    color: '#10B981'
  }
];

export const statusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_PENDING,
    label: 'Đang chờ',
    color: COLOR_STATUS_PENDING
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  },
  {
    value: STATUS_DELETED,
    label: 'Đã xóa',
    color: COLOR_STATUS_ERROR
  }
];

export const employeeStatusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  }
];

export const movieStatusOptions = [
  {
    label: 'Hoạt động',
    value: STATUS_ACTIVE,
    color: COLOR_STATUS_ACTIVE
  },
  {
    label: 'Đang chờ',
    value: STATUS_PENDING,
    color: COLOR_STATUS_PENDING
  }
];

export const FieldTypes = {
  STRING: 'STRING_TYPE',
  NUMBER: 'NUMBER_TYPE',
  SELECT: 'SELECT',
  AUTO_COMPLETE: 'AUTO_COMPLETE',
  DATE: 'DATE',
  DATE_RANGE: 'DATE_RANGE',
  BOOLEAN: 'BOOLEAN',
  MULTI_SELECT: 'MULTI_SELECT'
} as const;

export const genderOptions: OptionType[] = [
  { value: GENDER_MALE, label: 'Nam' },
  { value: GENDER_FEMALE, label: 'Nữ' },
  { value: GENDER_OTHER, label: 'Khác' }
];

export const queryKeys = {
  ADMIN: 'admin',
  APP_VERSION: 'app-version',
  CATEGORY_LIST: 'category-list',
  CATEGORY: 'category',
  CHANGE_ADMIN_STATUS: 'change-admin-status',
  CHANGE_COMMENT_STATUS: 'change-status-comment',
  CHANGE_EMPLOYEE_STATUS: 'change-employee-status',
  CHANGE_REVIEW_STATUS: 'change-status-review',
  CHANGE_USER_STATUS: 'change-user-status',
  COLLECTION_ITEM_LIST: 'collection-item-list',
  COLLECTION_ITEM: 'collection-item',
  COLLECTION_LIST: 'collection-list',
  COLLECTION: 'collection',
  COMMENT_INFINITE: 'comment-infinite',
  COMMENT: 'comment',
  CREATE_MOVIE_PERSON: 'create-movie-person',
  DELETE_ALL_NOTIFICATION: 'delete-all-notification',
  DELETE_FILE: 'delete-file',
  EMPLOYEE_PROFILE: 'employee-profile',
  EMPLOYEE: 'employee',
  FILE: 'file',
  GROUP_LIST: 'group-list',
  GROUP_PERMISSION_LIST: 'group-permission-list',
  GROUP_PERMISSION: 'group-permission',
  GROUP: 'group',
  LOGIN: 'login',
  LOGOUT: 'logout',
  MARK_LATEST_MOVIE_ITEM: 'mark-latest-movie-item',
  MOVIE_DISTRIBUTION_STATISTICS: 'movie-distribution-statistics',
  MOVIE_ITEM_LIST: 'movie-item-list',
  MOVIE_ITEM: 'movie-item',
  MOVIE_PERSON_LIST: 'movie-person-list',
  MOVIE_PERSON: 'movie-person',
  MOVIE: 'movie',
  NOTIFICATION_INFINITE: 'notification-infinite',
  NOTIFICATION: 'notification',
  OVERVIEW_STATISTICS: 'overview-statistics',
  PERMISSION_DELETE: 'permission-delete',
  PERMISSION_LIST: 'permission-list',
  PERMISSION: 'permission',
  PERSON: 'person',
  PIN_COMMENT: 'pin-comment',
  PROCESS_AUDIO_VIDEO_LIBRARY: 'process-audio-video-library',
  PROFILE: 'profile',
  READ_ALL_NOTIFICATION: 'read-all-notification',
  REFRESH_TOKEN: 'refresh-token',
  RETRY_PROCESS_VIDEO_LIBRARY: 'retry-process-video-library',
  REVIEW_INFINITE: 'review-infinite',
  REVIEW: 'review',
  SERVER_CONFIG_CHANGE_STATUS: 'server-config-change-status',
  SERVER_CONFIG_LIST: 'server-config-list',
  SERVER_CONFIG: 'server-config',
  SESSION: 'session',
  SETTING_AUTO_COMPLETE: 'setting-auto-complete',
  SETTING: 'setting',
  SIDEBAR_LIST: 'sidebar-list',
  SIDEBAR: 'sidebar',
  SNS_CONFIG: 'sns-config',
  STYLE: 'style',
  TOP_MOVIES_STATISTICS: 'top-movies-statistics',
  UNREAD_NOTIFICATION_COUNT: 'unread-notification-count',
  UPDATE_MOVIE_PERSON: 'update-movie-person',
  UPDATE_READ_NOTIFICATION: 'update-read-notification',
  UPLOAD_AVATAR_FILE: 'upload-avatar-file',
  UPLOAD_FILE: 'upload-file',
  UPLOAD_LOGO_FILE: 'upload-logo-file',
  USER: 'user',
  VIDEO_LIBRARY_LIST: 'video-library-list',
  VIDEO_LIBRARY: 'video-library',
  VOTE_COMMENT: 'vote-comment',
  VIDEO_LIBRARY_SUBTITLE: 'video-library-subtitle',
  VIDEO_LIBRARY_SUBTITLE_LIST: 'video-library-subtitle-list',
  VIDEO_LIBRARY_SUBTITLE_TRANSLATE: 'video-library-subtitle-translate'
};

export const userKindOptions = [
  {
    label: 'Người dùng',
    value: GROUP_KIND_USER
  }
];

export const countryOptions = [
  {
    value: 'SA',
    label: 'Ả Rập Xê Út'
  },
  {
    value: 'AF',
    label: 'Afghanistan'
  },
  {
    value: 'EG',
    label: 'Ai Cập'
  },
  {
    value: 'AL',
    label: 'Albania'
  },
  {
    value: 'DZ',
    label: 'Algeria'
  },
  {
    value: 'IN',
    label: 'Ấn Độ'
  },
  {
    value: 'AD',
    label: 'Andorra'
  },
  {
    value: 'AO',
    label: 'Angola'
  },
  {
    value: 'AI',
    label: 'Anguilla'
  },
  {
    value: 'GB',
    label: 'Anh'
  },
  {
    value: 'AG',
    label: 'Antigua và Barbuda'
  },
  {
    value: 'AT',
    label: 'Áo'
  },
  {
    value: 'AR',
    label: 'Argentina'
  },
  {
    value: 'AM',
    label: 'Armenia'
  },
  {
    value: 'AW',
    label: 'Aruba'
  },
  {
    value: 'AU',
    label: 'Australia'
  },
  {
    value: 'AZ',
    label: 'Azerbaijan'
  },
  {
    value: 'PL',
    label: 'Ba Lan'
  },
  {
    value: 'MK',
    label: 'Bắc Macedonia'
  },
  {
    value: 'BS',
    label: 'Bahamas'
  },
  {
    value: 'BH',
    label: 'Bahrain'
  },
  {
    value: 'BD',
    label: 'Bangladesh'
  },
  {
    value: 'BB',
    label: 'Barbados'
  },
  {
    value: 'BY',
    label: 'Belarus'
  },
  {
    value: 'BZ',
    label: 'Belize'
  },
  {
    value: 'BJ',
    label: 'Benin'
  },
  {
    value: 'BM',
    label: 'Bermuda'
  },
  {
    value: 'BT',
    label: 'Bhutan'
  },
  {
    value: 'BE',
    label: 'Bỉ'
  },
  {
    value: 'CI',
    label: 'Bờ Biển Ngà'
  },
  {
    value: 'PT',
    label: 'Bồ Đào Nha'
  },
  {
    value: 'BO',
    label: 'Bolivia'
  },
  {
    value: 'BA',
    label: 'Bosnia và Herzegovina'
  },
  {
    value: 'BW',
    label: 'Botswana'
  },
  {
    value: 'BR',
    label: 'Brazil'
  },
  {
    value: 'BN',
    label: 'Brunei'
  },
  {
    value: 'BG',
    label: 'Bulgaria'
  },
  {
    value: 'BF',
    label: 'Burkina Faso'
  },
  {
    value: 'BI',
    label: 'Burundi'
  },
  {
    value: 'AE',
    label: 'Các Tiểu Vương Quốc Ả Rập Thống Nhất'
  },
  {
    value: 'CM',
    label: 'Cameroon'
  },
  {
    value: 'KH',
    label: 'Campuchia'
  },
  {
    value: 'CA',
    label: 'Canada'
  },
  {
    value: 'CV',
    label: 'Cape Verde'
  },
  {
    value: 'CL',
    label: 'Chile'
  },
  {
    value: 'CO',
    label: 'Colombia'
  },
  {
    value: 'KM',
    label: 'Comoros'
  },
  {
    value: 'CD',
    label: 'Cộng hòa Dân chủ Congo'
  },
  {
    value: 'DO',
    label: 'Cộng hòa Dominica'
  },
  {
    value: 'CZ',
    label: 'Cộng hòa Séc'
  },
  {
    value: 'CG',
    label: 'Congo'
  },
  {
    value: 'CR',
    label: 'Costa Rica'
  },
  {
    value: 'HR',
    label: 'Croatia'
  },
  {
    value: 'CU',
    label: 'Cuba'
  },
  {
    value: 'CW',
    label: 'Curaçao'
  },
  {
    value: 'TW',
    label: 'Đài Loan'
  },
  {
    value: 'DK',
    label: 'Đan Mạch'
  },
  {
    value: 'IM',
    label: 'Đảo Man'
  },
  {
    value: 'DJ',
    label: 'Djibouti'
  },
  {
    value: 'DM',
    label: 'Dominica'
  },
  {
    value: 'TL',
    label: 'Đông Timor'
  },
  {
    value: 'DE',
    label: 'Đức'
  },
  {
    value: 'EC',
    label: 'Ecuador'
  },
  {
    value: 'SV',
    label: 'El Salvador'
  },
  {
    value: 'ER',
    label: 'Eritrea'
  },
  {
    value: 'EE',
    label: 'Estonia'
  },
  {
    value: 'SZ',
    label: 'Eswatini'
  },
  {
    value: 'ET',
    label: 'Ethiopia'
  },
  {
    value: 'FJ',
    label: 'Fiji'
  },
  {
    value: 'GA',
    label: 'Gabon'
  },
  {
    value: 'GM',
    label: 'Gambia'
  },
  {
    value: 'GE',
    label: 'Georgia'
  },
  {
    value: 'GH',
    label: 'Ghana'
  },
  {
    value: 'GI',
    label: 'Gibraltar'
  },
  {
    value: 'GL',
    label: 'Greenland'
  },
  {
    value: 'GD',
    label: 'Grenada'
  },
  {
    value: 'GU',
    label: 'Guam'
  },
  {
    value: 'GT',
    label: 'Guatemala'
  },
  {
    value: 'GG',
    label: 'Guernsey'
  },
  {
    value: 'GN',
    label: 'Guinea'
  },
  {
    value: 'GQ',
    label: 'Guinea Xích Đạo'
  },
  {
    value: 'GW',
    label: 'Guinea-Bissau'
  },
  {
    value: 'GY',
    label: 'Guyana'
  },
  {
    value: 'NL',
    label: 'Hà Lan'
  },
  {
    value: 'HT',
    label: 'Haiti'
  },
  {
    value: 'KR',
    label: 'Hàn Quốc'
  },
  {
    value: 'US',
    label: 'Hoa Kỳ'
  },
  {
    value: 'HN',
    label: 'Honduras'
  },
  {
    value: 'HK',
    label: 'Hồng Kông'
  },
  {
    value: 'HU',
    label: 'Hungary'
  },
  {
    value: 'GR',
    label: 'Hy Lạp'
  },
  {
    value: 'IS',
    label: 'Iceland'
  },
  {
    value: 'ID',
    label: 'Indonesia'
  },
  {
    value: 'IR',
    label: 'Iran'
  },
  {
    value: 'IQ',
    label: 'Iraq'
  },
  {
    value: 'IE',
    label: 'Ireland'
  },
  {
    value: 'IL',
    label: 'Israel'
  },
  {
    value: 'JM',
    label: 'Jamaica'
  },
  {
    value: 'JE',
    label: 'Jersey'
  },
  {
    value: 'JO',
    label: 'Jordan'
  },
  {
    value: 'KZ',
    label: 'Kazakhstan'
  },
  {
    value: 'KE',
    label: 'Kenya'
  },
  {
    value: 'KI',
    label: 'Kiribati'
  },
  {
    value: 'KW',
    label: 'Kuwait'
  },
  {
    value: 'KG',
    label: 'Kyrgyzstan'
  },
  {
    value: 'LA',
    label: 'Lào'
  },
  {
    value: 'LV',
    label: 'Latvia'
  },
  {
    value: 'LB',
    label: 'Lebanon'
  },
  {
    value: 'LS',
    label: 'Lesotho'
  },
  {
    value: 'LR',
    label: 'Liberia'
  },
  {
    value: 'LY',
    label: 'Libya'
  },
  {
    value: 'LI',
    label: 'Liechtenstein'
  },
  {
    value: 'LT',
    label: 'Lithuania'
  },
  {
    value: 'LU',
    label: 'Luxembourg'
  },
  {
    value: 'MO',
    label: 'Macao'
  },
  {
    value: 'MG',
    label: 'Madagascar'
  },
  {
    value: 'MW',
    label: 'Malawi'
  },
  {
    value: 'MY',
    label: 'Malaysia'
  },
  {
    value: 'MV',
    label: 'Maldives'
  },
  {
    value: 'ML',
    label: 'Mali'
  },
  {
    value: 'MT',
    label: 'Malta'
  },
  {
    value: 'MR',
    label: 'Mauritania'
  },
  {
    value: 'MU',
    label: 'Mauritius'
  },
  {
    value: 'MX',
    label: 'Mexico'
  },
  {
    value: 'FM',
    label: 'Micronesia'
  },
  {
    value: 'MD',
    label: 'Moldova'
  },
  {
    value: 'MC',
    label: 'Monaco'
  },
  {
    value: 'MN',
    label: 'Mông Cổ'
  },
  {
    value: 'ME',
    label: 'Montenegro'
  },
  {
    value: 'MA',
    label: 'Morocco'
  },
  {
    value: 'MZ',
    label: 'Mozambique'
  },
  {
    value: 'MM',
    label: 'Myanmar'
  },
  {
    value: 'NO',
    label: 'Na Uy'
  },
  {
    value: 'ZA',
    label: 'Nam Phi'
  },
  {
    value: 'SS',
    label: 'Nam Sudan'
  },
  {
    value: 'NA',
    label: 'Namibia'
  },
  {
    value: 'NR',
    label: 'Nauru'
  },
  {
    value: 'NP',
    label: 'Nepal'
  },
  {
    value: 'NC',
    label: 'New Caledonia'
  },
  {
    value: 'NZ',
    label: 'New Zealand'
  },
  {
    value: 'RU',
    label: 'Nga'
  },
  {
    value: 'JP',
    label: 'Nhật Bản'
  },
  {
    value: 'NI',
    label: 'Nicaragua'
  },
  {
    value: 'NE',
    label: 'Niger'
  },
  {
    value: 'NG',
    label: 'Nigeria'
  },
  {
    value: 'OM',
    label: 'Oman'
  },
  {
    value: 'PK',
    label: 'Pakistan'
  },
  {
    value: 'PW',
    label: 'Palau'
  },
  {
    value: 'PS',
    label: 'Palestine'
  },
  {
    value: 'PA',
    label: 'Panama'
  },
  {
    value: 'PG',
    label: 'Papua New Guinea'
  },
  {
    value: 'PY',
    label: 'Paraguay'
  },
  {
    value: 'PE',
    label: 'Peru'
  },
  {
    value: 'FI',
    label: 'Phần Lan'
  },
  {
    value: 'FR',
    label: 'Pháp'
  },
  {
    value: 'PH',
    label: 'Philippines'
  },
  {
    value: 'PF',
    label: 'Polynesia thuộc Pháp'
  },
  {
    value: 'PR',
    label: 'Puerto Rico'
  },
  {
    value: 'QA',
    label: 'Qatar'
  },
  {
    value: 'CK',
    label: 'Quần đảo Cook'
  },
  {
    value: 'MH',
    label: 'Quần đảo Marshall'
  },
  {
    value: 'SB',
    label: 'Quần đảo Solomon'
  },
  {
    value: 'RO',
    label: 'Romania'
  },
  {
    value: 'RW',
    label: 'Rwanda'
  },
  {
    value: 'KN',
    label: 'Saint Kitts và Nevis'
  },
  {
    value: 'LC',
    label: 'Saint Lucia'
  },
  {
    value: 'VC',
    label: 'Saint Vincent và Grenadines'
  },
  {
    value: 'WS',
    label: 'Samoa'
  },
  {
    value: 'SM',
    label: 'San Marino'
  },
  {
    value: 'ST',
    label: 'São Tomé và Príncipe'
  },
  {
    value: 'SN',
    label: 'Senegal'
  },
  {
    value: 'RS',
    label: 'Serbia'
  },
  {
    value: 'SC',
    label: 'Seychelles'
  },
  {
    value: 'SL',
    label: 'Sierra Leone'
  },
  {
    value: 'SG',
    label: 'Singapore'
  },
  {
    value: 'CY',
    label: 'Síp'
  },
  {
    value: 'SK',
    label: 'Slovakia'
  },
  {
    value: 'SI',
    label: 'Slovenia'
  },
  {
    value: 'SO',
    label: 'Somalia'
  },
  {
    value: 'LK',
    label: 'Sri Lanka'
  },
  {
    value: 'SD',
    label: 'Sudan'
  },
  {
    value: 'SR',
    label: 'Suriname'
  },
  {
    value: 'SY',
    label: 'Syria'
  },
  {
    value: 'TJ',
    label: 'Tajikistan'
  },
  {
    value: 'TZ',
    label: 'Tanzania'
  },
  {
    value: 'ES',
    label: 'Tây Ban Nha'
  },
  {
    value: 'TD',
    label: 'Tchad'
  },
  {
    value: 'TH',
    label: 'Thái Lan'
  },
  {
    value: 'TR',
    label: 'Thổ Nhĩ Kỳ'
  },
  {
    value: 'SE',
    label: 'Thụy Điển'
  },
  {
    value: 'CH',
    label: 'Thụy Sĩ'
  },
  {
    value: 'TG',
    label: 'Togo'
  },
  {
    value: 'TO',
    label: 'Tonga'
  },
  {
    value: 'KP',
    label: 'Triều Tiên'
  },
  {
    value: 'TT',
    label: 'Trinidad và Tobago'
  },
  {
    value: 'CN',
    label: 'Trung Quốc'
  },
  {
    value: 'TN',
    label: 'Tunisia'
  },
  {
    value: 'TM',
    label: 'Turkmenistan'
  },
  {
    value: 'TV',
    label: 'Tuvalu'
  },
  {
    value: 'UG',
    label: 'Uganda'
  },
  {
    value: 'UA',
    label: 'Ukraina'
  },
  {
    value: 'UY',
    label: 'Uruguay'
  },
  {
    value: 'UZ',
    label: 'Uzbekistan'
  },
  {
    value: 'VU',
    label: 'Vanuatu'
  },
  {
    value: 'VA',
    label: 'Vatican'
  },
  {
    value: 'VE',
    label: 'Venezuela'
  },
  {
    value: 'VN',
    label: 'Việt Nam'
  },
  {
    value: 'IT',
    label: 'Ý'
  },
  {
    value: 'YE',
    label: 'Yemen'
  },
  {
    value: 'ZM',
    label: 'Zambia'
  },
  {
    value: 'ZW',
    label: 'Zimbabwe'
  }
];

export const languageOptions = [
  {
    value: 'ar',
    label: 'Tiếng Ả Rập'
  },
  {
    value: 'af',
    label: 'Tiếng Afrikaans'
  },
  {
    value: 'sq',
    label: 'Tiếng Albania'
  },
  {
    value: 'am',
    label: 'Tiếng Amharic'
  },
  {
    value: 'en',
    label: 'Tiếng Anh'
  },
  {
    value: 'hy',
    label: 'Tiếng Armenia'
  },
  {
    value: 'as',
    label: 'Tiếng Assam'
  },
  {
    value: 'az',
    label: 'Tiếng Azerbaijan'
  },
  {
    value: 'pl',
    label: 'Tiếng Ba Lan'
  },
  {
    value: 'fa',
    label: 'Tiếng Ba Tư (Persian)'
  },
  {
    value: 'eu',
    label: 'Tiếng Basque'
  },
  {
    value: 'be',
    label: 'Tiếng Belarus'
  },
  {
    value: 'bn',
    label: 'Tiếng Bengal'
  },
  {
    value: 'pt',
    label: 'Tiếng Bồ Đào Nha'
  },
  {
    value: 'bs',
    label: 'Tiếng Bosnia'
  },
  {
    value: 'bg',
    label: 'Tiếng Bulgaria'
  },
  {
    value: 'my',
    label: 'Tiếng Burmese (Miến Điện)'
  },
  {
    value: 'ca',
    label: 'Tiếng Catalan'
  },
  {
    value: 'ceb',
    label: 'Tiếng Cebuano'
  },
  {
    value: 'ny',
    label: 'Tiếng Chichewa'
  },
  {
    value: 'co',
    label: 'Tiếng Corsican'
  },
  {
    value: 'hr',
    label: 'Tiếng Croatia'
  },
  {
    value: 'cs',
    label: 'Tiếng Czech (Séc)'
  },
  {
    value: 'da',
    label: 'Tiếng Đan Mạch'
  },
  {
    value: 'de',
    label: 'Tiếng Đức'
  },
  {
    value: 'eo',
    label: 'Tiếng Esperanto'
  },
  {
    value: 'et',
    label: 'Tiếng Estonia'
  },
  {
    value: 'fy',
    label: 'Tiếng Frisian'
  },
  {
    value: 'gl',
    label: 'Tiếng Galician'
  },
  {
    value: 'ka',
    label: 'Tiếng Georgia'
  },
  {
    value: 'gu',
    label: 'Tiếng Gujarati'
  },
  {
    value: 'nl',
    label: 'Tiếng Hà Lan'
  },
  {
    value: 'ht',
    label: 'Tiếng Haiti'
  },
  {
    value: 'ko',
    label: 'Tiếng Hàn'
  },
  {
    value: 'ha',
    label: 'Tiếng Hausa'
  },
  {
    value: 'haw',
    label: 'Tiếng Hawaii'
  },
  {
    value: 'he',
    label: 'Tiếng Hebrew'
  },
  {
    value: 'hi',
    label: 'Tiếng Hindi'
  },
  {
    value: 'hmn',
    label: 'Tiếng Hmong'
  },
  {
    value: 'hu',
    label: 'Tiếng Hungary'
  },
  {
    value: 'el',
    label: 'Tiếng Hy Lạp'
  },
  {
    value: 'is',
    label: 'Tiếng Iceland'
  },
  {
    value: 'ig',
    label: 'Tiếng Igbo'
  },
  {
    value: 'id',
    label: 'Tiếng Indonesia'
  },
  {
    value: 'ga',
    label: 'Tiếng Ireland'
  },
  {
    value: 'jv',
    label: 'Tiếng Java'
  },
  {
    value: 'kn',
    label: 'Tiếng Kannada'
  },
  {
    value: 'kk',
    label: 'Tiếng Kazakh'
  },
  {
    value: 'km',
    label: 'Tiếng Khmer (Campuchia)'
  },
  {
    value: 'rw',
    label: 'Tiếng Kinyarwanda'
  },
  {
    value: 'ku',
    label: 'Tiếng Kurdish'
  },
  {
    value: 'ky',
    label: 'Tiếng Kyrgyz'
  },
  {
    value: 'lo',
    label: 'Tiếng Lào'
  },
  {
    value: 'la',
    label: 'Tiếng Latin'
  },
  {
    value: 'lv',
    label: 'Tiếng Latvia'
  },
  {
    value: 'lt',
    label: 'Tiếng Lithuania'
  },
  {
    value: 'lb',
    label: 'Tiếng Luxembourg'
  },
  {
    value: 'ms',
    label: 'Tiếng Mã Lai'
  },
  {
    value: 'mk',
    label: 'Tiếng Macedonia'
  },
  {
    value: 'mg',
    label: 'Tiếng Malagasy'
  },
  {
    value: 'ml',
    label: 'Tiếng Malayalam'
  },
  {
    value: 'mt',
    label: 'Tiếng Malta'
  },
  {
    value: 'mi',
    label: 'Tiếng Maori'
  },
  {
    value: 'mr',
    label: 'Tiếng Marathi'
  },
  {
    value: 'mn',
    label: 'Tiếng Mông Cổ'
  },
  {
    value: 'no',
    label: 'Tiếng Na Uy'
  },
  {
    value: 'ne',
    label: 'Tiếng Nepal'
  },
  {
    value: 'ru',
    label: 'Tiếng Nga'
  },
  {
    value: 'ja',
    label: 'Tiếng Nhật'
  },
  {
    value: 'or',
    label: 'Tiếng Odia'
  },
  {
    value: 'ps',
    label: 'Tiếng Pashto'
  },
  {
    value: 'fi',
    label: 'Tiếng Phần Lan'
  },
  {
    value: 'fr',
    label: 'Tiếng Pháp'
  },
  {
    value: 'pa',
    label: 'Tiếng Punjabi'
  },
  {
    value: 'ro',
    label: 'Tiếng Romania'
  },
  {
    value: 'sm',
    label: 'Tiếng Samoa'
  },
  {
    value: 'gd',
    label: 'Tiếng Scotland Gaelic'
  },
  {
    value: 'sr',
    label: 'Tiếng Serbia'
  },
  {
    value: 'st',
    label: 'Tiếng Sesotho'
  },
  {
    value: 'sn',
    label: 'Tiếng Shona'
  },
  {
    value: 'sd',
    label: 'Tiếng Sindhi'
  },
  {
    value: 'si',
    label: 'Tiếng Sinhala'
  },
  {
    value: 'sk',
    label: 'Tiếng Slovak'
  },
  {
    value: 'sl',
    label: 'Tiếng Slovenia'
  },
  {
    value: 'so',
    label: 'Tiếng Somali'
  },
  {
    value: 'su',
    label: 'Tiếng Sundanese'
  },
  {
    value: 'sw',
    label: 'Tiếng Swahili'
  },
  {
    value: 'tl',
    label: 'Tiếng Tagalog (Filipino)'
  },
  {
    value: 'tg',
    label: 'Tiếng Tajik'
  },
  {
    value: 'ta',
    label: 'Tiếng Tamil'
  },
  {
    value: 'tt',
    label: 'Tiếng Tatar'
  },
  {
    value: 'es',
    label: 'Tiếng Tây Ban Nha'
  },
  {
    value: 'te',
    label: 'Tiếng Telugu'
  },
  {
    value: 'th',
    label: 'Tiếng Thái'
  },
  {
    value: 'tr',
    label: 'Tiếng Thổ Nhĩ Kỳ'
  },
  {
    value: 'sv',
    label: 'Tiếng Thụy Điển'
  },
  {
    value: 'zh',
    label: 'Tiếng Trung'
  },
  {
    value: 'zh-CN',
    label: 'Tiếng Trung (Giản thể)'
  },
  {
    value: 'zh-TW',
    label: 'Tiếng Trung (Phồn thể)'
  },
  {
    value: 'tk',
    label: 'Tiếng Turkmen'
  },
  {
    value: 'uk',
    label: 'Tiếng Ukraina'
  },
  {
    value: 'ur',
    label: 'Tiếng Urdu'
  },
  {
    value: 'ug',
    label: 'Tiếng Uyghur'
  },
  {
    value: 'uz',
    label: 'Tiếng Uzbek'
  },
  {
    value: 'vi',
    label: 'Tiếng Việt'
  },
  {
    value: 'cy',
    label: 'Tiếng Wales'
  },
  {
    value: 'xh',
    label: 'Tiếng Xhosa'
  },
  {
    value: 'it',
    label: 'Tiếng Ý'
  },
  {
    value: 'yi',
    label: 'Tiếng Yiddish'
  },
  {
    value: 'yo',
    label: 'Tiếng Yoruba'
  },
  {
    value: 'zu',
    label: 'Tiếng Zulu'
  }
];

export const personKinds = [
  {
    label: 'Diễn viên',
    value: PERSON_KIND_ACTOR
  },
  {
    label: 'Đạo diễn',
    value: PERSON_KIND_DIRECTOR
  }
];

export const videoLibraryStateOptions = [
  {
    label: 'Đang xử lý',
    value: VIDEO_LIBRARY_STATE_PROCESSING
  },
  { label: 'Đã hoàn thành', value: VIDEO_LIBRARY_STATE_COMPLETE }
];

export const ageRatingOptions = [
  {
    value: AGE_RATING_GENERAL,
    label: 'G',
    mean: 'Phù hợp với mọi lứa tuổi'
  },
  {
    value: AGE_RATING_PG,
    label: 'PG',
    mean: 'Dành cho khán giả dưới 13 tuổi khi có cha mẹ hoặc người giám hộ đi cùng'
  },
  {
    value: AGE_RATING_PG13,
    label: 'PG-13',
    mean: 'Dành cho khán giả từ đủ 13 tuổi trở lên'
  },
  {
    value: AGE_RATING_R,
    label: 'R',
    mean: 'Dành cho khán giả từ đủ 16 tuổi trở lên'
  },
  {
    value: AGE_RATING_NC17,
    label: 'NC-17',
    mean: 'Dành cho khán giả từ đủ 18 tuổi trở lên'
  },
  {
    value: AGE_RATING_18_PLUS,
    label: '18+',
    mean: 'Nội dung chỉ dành cho người trưởng thành từ 18 tuổi trở lên'
  }
];

export const movieTypeOptions = [
  {
    value: MOVIE_TYPE_SINGLE,
    label: 'Phim lẻ'
  },
  {
    value: MOVIE_TYPE_SERIES,
    label: 'Phim bộ'
  }
];

export const movieItemKindOptions = [
  {
    value: MOVIE_ITEM_KIND_SEASON,
    label: 'Phần'
  },
  {
    value: MOVIE_ITEM_KIND_EPISODE,
    label: 'Tập'
  },
  {
    value: MOVIE_TYPE_TRAILER,
    label: 'Trailer'
  }
];

export const movieItemSingleKindOptions = [
  {
    value: MOVIE_ITEM_KIND_SEASON,
    label: 'Phần'
  },
  {
    value: MOVIE_TYPE_TRAILER,
    label: 'Trailer'
  }
];

export const movieItemSeriesKindOptions = [
  {
    value: MOVIE_ITEM_KIND_SEASON,
    label: 'Phần'
  },
  {
    value: MOVIE_ITEM_KIND_EPISODE,
    label: 'Tập'
  },
  {
    value: MOVIE_TYPE_TRAILER,
    label: 'Trailer'
  }
];

export const featureOptions = [
  {
    value: MOVIE_IS_FEATURED,
    label: 'Hot'
  },
  {
    value: MOVIE_IS_NOT_FEATURED,
    label: 'Không hot'
  }
];

export const movieSidebarStatusOptions = [
  {
    value: MOVIE_SIDEBAR_ACTIVE,
    label: 'Hiện'
  },
  {
    value: MOVIE_SIDEBAR_INACTIVE,
    label: 'Ẩn'
  }
];

export const videoLibrarySourceTypeOptions = [
  {
    label: 'Tải lên',
    value: VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
  },
  {
    label: 'Bên ngoài',
    value: VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL
  }
];

export const collectionTypeOptions = [
  {
    label: 'Chủ đề',
    value: COLLECTION_TYPE_TOPIC
  },
  {
    label: 'Phần',
    value: COLLECTION_TYPE_SECTION
  }
];

export const serverConfigStatusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  },
  {
    value: STATUS_PENDING,
    label: 'Đang chờ',
    color: COLOR_STATUS_PENDING
  }
];

export const mqttTopics = {
  CMS: 'notification/cms',
  ACCOUNT: 'notification/:accountId'
};

export const mqttCMDs = {
  DONE_CONVERT_AUDIO: 'CMD_DONE_CONVERT_AUDIO',
  DONE_CONVERT_VIDEO: 'CMD_DONE_CONVERT_VIDEO',
  DONE_PROCESS_SUBTITLE: 'CMD_DONE_PROCESS_SUBTITLE',
  REPLY_COMMENT: 'CMD_REPLY_COMMENT',
  SEND_NOTIFICATION: 'CMD_SEND_NOTIFICATION',
  TOXIC_COMMENT_LOCKED: 'CMD_TOXIC_COMMENT_LOCKED',
  VOTE_COMMENT: 'CMD_VOTE_COMMENT'
};

export const settingDataTypes = [
  {
    label: 'Integer',
    value: 'Integer'
  },
  {
    label: 'String',
    value: 'String'
  },
  {
    label: 'Boolean',
    value: 'Boolean'
  },
  {
    label: 'Double',
    value: 'Double'
  },
  {
    label: 'RichText',
    value: 'RichText'
  },
  {
    label: 'Select',
    value: 'Select'
  },
  {
    label: 'Upload',
    value: 'Upload'
  }
];

export const sendForOptions = [
  { value: SEND_NOTIFICATION_FOR_ALL_USERS, label: 'Tất cả người dùng' },
  {
    value: SEND_NOTIFICATION_FOR_INTERESTED_USERS,
    label: 'Người dùng quan tâm'
  }
];

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
  SERVER_CONFIG: 'máy chủ',
  SETTING: 'cài đặt',
  SIDEBAR: 'phim',
  STYLE: 'thiết kế',
  SUBTITLE: 'phụ đề',
  USER: 'người dùng',
  VIDEO: 'video'
} as const;

export type ObjectNameKey = keyof typeof objectNames;

export const videoLibraryErrorReasons = [
  {
    value: DOWNLOAD_TEMP_FILE_FAILED,
    label: 'Tải file tạm thất bại'
  },
  {
    value: CONVERT_FILE_FAILED,
    label: 'Chuyển đổi file thất bại'
  },
  {
    value: GENERATE_VTT_FAILED,
    label: 'Tạo file VTT thất bại'
  },
  {
    value: NO_SPEECH,
    label: 'Video không có phụ đề'
  }
];

export const distributionGroupOptions: {
  label: string;
  value: DistributionGroupBy;
}[] = [
  { label: 'Loại phim', value: 'type' },
  { label: 'Quốc gia', value: 'country' },
  { label: 'Ngôn ngữ', value: 'language' },
  { label: 'Độ tuổi', value: 'ageRating' }
];

export const topMovieSortOptions: {
  label: string;
  value: TopMoviesSortBy;
}[] = [
  { label: 'Top lượt xem', value: 'viewCount' },
  { label: 'Top bình luận', value: 'commentCount' },
  { label: 'Top review', value: 'reviewCount' },
  { label: 'Top điểm đánh giá', value: 'averageRating' }
];

export const chartColors = [
  '#1678ff',
  '#16a34a',
  '#f97316',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ca8a04',
  '#475569'
];

export const typeLabelMap: Record<number | string, string> = {
  [MOVIE_TYPE_SINGLE]: 'Phim lẻ',
  [MOVIE_TYPE_SERIES]: 'Phim bộ',
  Unknown: 'Không xác định'
};

export const ageRatingLabelMap: Record<number | string, string> = {
  [AGE_RATING_GENERAL]: 'G',
  [AGE_RATING_PG]: 'PG',
  [AGE_RATING_PG13]: 'PG-13',
  [AGE_RATING_R]: 'R',
  [AGE_RATING_NC17]: 'NC-17',
  [AGE_RATING_18_PLUS]: '18+',
  Unknown: 'Không xác định'
};

export const notificationOtions = [
  {
    value: NOTIFICATION_TYPE_COMMUNITY,
    label: 'Cộng đồng'
  },
  {
    value: NOTIFICATION_TYPE_SYSTEM,
    label: 'Hệ thống'
  }
];
