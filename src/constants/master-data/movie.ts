import {
  MOVIE_IS_FEATURED,
  MOVIE_IS_NOT_FEATURED,
  MOVIE_ITEM_KIND_EPISODE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_SIDEBAR_ACTIVE,
  MOVIE_SIDEBAR_INACTIVE,
  MOVIE_TYPE_SERIES,
  MOVIE_TYPE_SINGLE,
  MOVIE_TYPE_TRAILER
} from '@/constants/constant';

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
