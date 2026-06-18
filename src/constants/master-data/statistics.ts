import { MOVIE_TYPE_SERIES, MOVIE_TYPE_SINGLE } from '@/constants/constant';
import { DistributionGroupBy, TopMoviesSortBy } from '@/types';

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
