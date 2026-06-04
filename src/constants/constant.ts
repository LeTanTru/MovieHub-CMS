export const DEFAULT_TABLE_PAGE_SIZE = 10;
export const DEFAULT_TABLE_PAGE_START = 0;
export const MAX_PAGE_SIZE = 1_000_000;
export const NOTIFICATION_PAGE_SIZE = 20;
export const QUERY_STALE_TIME = 60 * 1000;

export const UPLOAD_LOGO = 'LOGO';
export const UPLOAD_AVATAR = 'AVATAR';
export const UPLOAD_SYSTEM = 'SYSTEM';

export const GROUP_KIND_ADMIN = 1;
export const GROUP_KIND_EMPLOYEE = 2;
export const GROUP_KIND_USER = 3;

export const STATUS_PENDING = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_LOCK = -1;
export const STATUS_DELETED = -2;
export const STATUS_INACTIVE = 0;

export const GENDER_MALE = 1;
export const GENDER_FEMALE = 2;
export const GENDER_OTHER = 3;

export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_DATE_FORMAT = 'HH:mm:ss dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
export const DAY_DATE_TIME_FORMAT = 'EEEE HH:mm:ss dd/MM/yyyy';

export const DATE_FORMAT_UTC = 'MM/dd/yyyy';
export const TIME_DATE_FORMAT_UTC = 'HH:mm:ss MM/dd/yyyy';
export const DAY_DATE_TIME_FORMAT_UTC = 'EEEE HH:mm:ss MM/dd/yyyy';

export const PERSON_KIND_ACTOR = 1;
export const PERSON_KIND_DIRECTOR = 2;

export const TAB_PERSON_KIND_ACTOR = 'actor_tab';
export const TAB_PERSON_KIND_DIRECTOR = 'director_tab';

export const TAB_MOVIE_PERSON_KIND_ACTOR = 'actor_tab';
export const TAB_MOVIE_PERSON_KIND_DIRECTOR = 'director_tab';

export const VIDEO_LIBRARY_STATE_PROCESSING = 0;
export const VIDEO_LIBRARY_STATE_COMPLETE = 1;
export const VIDEO_LIBRARY_STATE_ERROR = 2;

export const MOVIE_TYPE_SINGLE = 1;
export const MOVIE_TYPE_SERIES = 2;
export const MOVIE_TYPE_TRAILER = 3;

export const MOVIE_ITEM_KIND_SEASON = 1;
export const MOVIE_ITEM_KIND_EPISODE = 2;
export const MOVIE_ITEM_KIND_TRAILER = 3;

export const AGE_RATING_P = 1;
export const AGE_RATING_K = 2;
export const AGE_RATING_T13 = 3;
export const AGE_RATING_T16 = 4;
export const AGE_RATING_T18 = 5;
export const AGE_RATING_18_PLUS = 6;

export const MOVIE_IS_FEATURED = 1;
export const MOVIE_IS_NOT_FEATURED = 0;

export const MOVIE_SIDEBAR_ACTIVE = 1;
export const MOVIE_SIDEBAR_INACTIVE = 0;

export const VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL = 1;
export const VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL = 2;

export const COLLECTION_TYPE_TOPIC = 1;
export const COLLECTION_TYPE_SECTION = 2;

export const INITIAL_AUTO_COMPLETE_SIZE = 10;

export const REACTION_TYPE_LIKE = 1;
export const REACTION_TYPE_DISLIKE = 2;

export const COMMENT_STATUS_SHOW = 1;
export const COMMENT_STATUS_HIDE = -1;

export const REVIEW_STATUS_SHOW = 1;
export const REVIEW_STATUS_HIDE = -1;

export const TAB_GROUP = 'group-list';
export const TAB_GROUP_PERMISSION = 'group-permission-list';
export const TAB_PERMISSION = 'permission-list';

export const VIDEO_QUALITY_AUTO = 0;
export const VIDEO_QUALITY_720 = 1;
export const VIDEO_QUALITY_1080 = 2;
export const VIDEO_QUALITY_1440 = 3;
export const VIDEO_QUALITY_MAX = 4;

export const SEND_NOTIFICATION_FOR_ALL_USERS = 1;
export const SEND_NOTIFICATION_FOR_INTERESTED_USERS = 2;

export const TAB_SETTING_GENERAL = 'general';
export const TAB_SETTING_LIVE_ROOM = 'live_room';

export const DOWNLOAD_TEMP_FILE_FAILED = 'download_temp_file_failed';
export const CONVERT_FILE_FAILED = 'convert_file_failed';
export const GENERATE_VTT_FAILED = 'generate_vtt_failed';
export const NO_SPEECH = 'no_speech';

export const AUDIO_STATE_PROCESSING = 0;
export const AUDIO_STATE_COMPLETE = 1;
export const AUDIO_STATE_ERROR = 2;

export const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60; // 1 day
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const USER_KIND_MAX_AGE = 24 * 60 * 60; // 1 day
export const CSRF_TOKEN_MAX_AGE = 60 * 60; // 1 hour

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const EMOJI_PICKER_Z_INDEX = 1000;
export const EMOJI_PICKER_TRANSITION_DURATION = '0.2s';
export const EMOJI_PICKER_TOP_OFFSET = 5;
export const EMOJI_ICON_SIZE = 25;

export const SKELETON_LOADING_COUNT = 8;

export const MOVIE_YEAR_MIN = 1900;

export const AVATAR_SIZE_COMMENT = 40;

export const BODY_SCROLL_LOCK_MARGIN = 15;

export const INDICATOR_AUTO_HIDE_MS = 800;

export const IMAGE_PREVIEW_SCALE_MIN = 1;
export const IMAGE_PREVIEW_SCALE_MAX = 3;
export const IMAGE_PREVIEW_SCALE_STEP = 0.1;

export const SLIDER_DEFAULT_MIN = 0;
export const SLIDER_DEFAULT_MAX = 100;

export const COLOR_STATUS_ACTIVE = '#00c950';
export const COLOR_STATUS_ERROR = '#dc3545';
export const COLOR_STATUS_PENDING = '#ffc107';

export const PARENT_PREFIX_PARAM = 'p_';

export const SUBTITLE_LOADING = 0;
export const SUBTITLE_COMPLETE = 1;

export const SUBTITLE_DELIMITER = '-->';

export const HOURS_TO_SECOND = 60 * 60;
export const MINUTES_TO_SECOND = 60;
export const SECONDS_TO_SECOND = 1;
export const MILLISECOND = 1_000;

export const DEFAULT_TIME = '00:00:00';
