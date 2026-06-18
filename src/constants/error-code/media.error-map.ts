import type {
  ErrorMaps,
  VideoLibraryBodyType,
  VideoLibrarySubtitleTranslateBodyType
} from '@/types';
import { ErrorCode } from './error-code';

export const videoLibraryErrorMaps: ErrorMaps<VideoLibraryBodyType> = {
  [ErrorCode.VIDEO_LIBRARY_ERROR_NAME_EXIST]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên video đã tồn tại'
      }
    ]
  ]
};

export const videoLibrarySubtitleErrorMaps: ErrorMaps<VideoLibrarySubtitleTranslateBodyType> =
  {
    [ErrorCode.VIDEO_LIBRARY_SUBTITLE_ERROR_LANGUAGE_EXISTED]: [
      [
        'language',
        {
          type: 'manual',
          message: 'Ngôn ngữ đã tồn tại'
        }
      ]
    ]
  };
