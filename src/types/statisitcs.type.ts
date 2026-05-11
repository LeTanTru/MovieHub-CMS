import {
  movieDistributonSearchSchema,
  overviewSearchSchema,
  topMoviesSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type MovieDistributionResType = {
  label: string;
  value: number;
};

export type OverviewResType = {
  averageRating: number;
  totalComments: number;
  totalFavourites: number;
  totalMovies: number;
  totalReviews: number;
  totalSeriesMovies: number;
  totalSingleMovies: number;
  totalUsers: number;
  totalViews: number;
};

export type TopMoviesResType = {
  averageRating: number;
  commentCount: number;
  id: number;
  reviewCount: number;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
};

export type MovieDistributionSearchType = z.infer<
  typeof movieDistributonSearchSchema
>;

export type OverviewSearchType = z.infer<typeof overviewSearchSchema>;

export type TopMoviesSearchType = z.infer<typeof topMoviesSchema> &
  BaseSearchType;

export type DistributionGroupBy = NonNullable<
  MovieDistributionSearchType['groupBy']
>;

export type TopMoviesSortBy = NonNullable<TopMoviesSearchType['sortBy']>;
