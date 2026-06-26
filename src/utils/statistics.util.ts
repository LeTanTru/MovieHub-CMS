import {
  ageRatingLabelMap,
  typeLabelMap,
  countryOptions,
  languageOptions,
  ageRatingOptions
} from '@/constants';
import { DistributionGroupBy, TopMoviesSortBy } from '@/types';

const numberFormatter = new Intl.NumberFormat('vi-VN');

/**
 * @param value The value to format as a statistic
 */
export const formatStatisticsValue = (value?: number) =>
  numberFormatter.format(value ?? 0);

/**
 * @param value The rating value to format
 */
export const formatRating = (value?: number) => (value ?? 0).toFixed(1);

/**
 * @param value The value to convert to a number for chart consumption
 */
export const toChartNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (Array.isArray(value)) return Number(value[0]) || 0;
  return 0;
};

/**
 * @param label The distribution label value
 * @param groupBy The grouping dimension (e.g. 'type', 'ageRating', 'country')
 */
export const getDistributionLabel = (
  label: string,
  groupBy: DistributionGroupBy
) => {
  if (groupBy === 'type') return typeLabelMap[label] ?? label;
  if (groupBy === 'ageRating') {
    return ageRatingOptions.find(
      (age) => age.label === ageRatingLabelMap[Number(label)]
    );
  }
  if (groupBy === 'country')
    return countryOptions.find((c) => c.value === label)?.label ?? label;
  if (groupBy === 'language')
    return languageOptions.find((l) => l.value === label)?.label ?? label;
  if (label === 'Unknown') return 'Không xác định';
  return label;
};

/**
 * @param movie The movie record
 * @param sortBy The metric to extract and format
 */
export const getMetricBySort = (
  movie: Record<TopMoviesSortBy, number>,
  sortBy: TopMoviesSortBy
) => {
  if (sortBy === 'averageRating') return formatRating(movie[sortBy]);
  return formatStatisticsValue(movie[sortBy]);
};
