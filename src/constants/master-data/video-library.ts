import {
  CONVERT_FILE_FAILED,
  DOWNLOAD_TEMP_FILE_FAILED,
  GENERATE_VTT_FAILED,
  NO_SPEECH,
  VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
  VIDEO_LIBRARY_STATE_COMPLETE,
  VIDEO_LIBRARY_STATE_PROCESSING
} from '@/constants/constant';

export const videoLibraryStateOptions = [
  {
    label: 'Đang xử lý',
    value: VIDEO_LIBRARY_STATE_PROCESSING
  },
  { label: 'Đã hoàn thành', value: VIDEO_LIBRARY_STATE_COMPLETE }
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
