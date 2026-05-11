import { ageRatingLabelMap, typeLabelMap } from '@/constants';
import { DistributionGroupBy, TopMoviesSortBy } from '@/types';

export const formatStatisticsValue = (value?: number) =>
  new Intl.NumberFormat('vi-VN').format(value ?? 0);

export const formatRating = (value?: number) => (value ?? 0).toFixed(1);

export const toChartNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (Array.isArray(value)) return Number(value[0]) || 0;
  return 0;
};

export const getDistributionLabel = (
  label: string,
  groupBy: DistributionGroupBy
) => {
  if (groupBy === 'type') return typeLabelMap[label] ?? label;
  if (groupBy === 'ageRating') return ageRatingLabelMap[label] ?? label;
  if (label === 'Unknown') return 'Không xác định';
  return label;
};

export const getMetricBySort = (
  movie: Record<TopMoviesSortBy, number>,
  sortBy: TopMoviesSortBy
) => {
  if (sortBy === 'averageRating') return formatRating(movie[sortBy]);
  return formatStatisticsValue(movie[sortBy]);
};
