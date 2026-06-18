import type {
  CategoryBodyType,
  CollectionBodyType,
  CollectionItemBodyType,
  ErrorMaps,
  MovieItemBodyType,
  PersonBodyType
} from '@/types';
import { ErrorCode } from './error-code';

export const categoryErrorMaps: ErrorMaps<CategoryBodyType> = {
  [ErrorCode.CATEGORY_ERROR_NAME_EXIST]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên thể loại đã tồn tại'
      }
    ]
  ]
};

export const personErrorMaps: ErrorMaps<PersonBodyType> = {};

export const movieItemErrorMaps: ErrorMaps<MovieItemBodyType> = {
  [ErrorCode.MOVIE_ITEM_ERROR_PARENT_REQUIRED]: [
    [
      'parentId',
      {
        type: 'manual',
        message: 'Vui lòng chọn phần để thêm'
      }
    ]
  ],
  [ErrorCode.MOVIE_ITEM_ERROR_LABEL_EXIST]: [
    ['label', { type: 'manual', message: 'Nhãn đã tồn tại' }]
  ]
};

export const collectionErrorMaps: ErrorMaps<CollectionBodyType> = {
  [ErrorCode.COLLECTION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên bộ sưu tập đã tồn tại' }]
  ]
};

export const collectionItemErrorMaps: ErrorMaps<CollectionItemBodyType> = {
  [ErrorCode.COLLECTION_ITEM_ERROR_MOVIE_EXIST]: [
    [
      'movieId',
      { type: 'manual', message: 'Phim này đã tồn tại trong bộ sưu tập' }
    ]
  ]
};
