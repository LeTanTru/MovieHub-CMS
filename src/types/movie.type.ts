import { movieSchema, movieSearchSchema } from '@/schemaValidations';
import type { CategoryResType } from '@/types/category.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type MovieResType = {
  ageRating: number;
  categories: CategoryResType[];
  country: string;
  createdDate: string;
  description: string;
  id: string;
  isFeatured: boolean;
  language: string;
  modifiedDate: string;
  originalTitle: string;
  posterUrl: string;
  releaseDate: string;
  seasons: {
    createdDate: string;
    description: string;
    episodes: any[];
    id: string;
    kind: number;
    label: string;
    modifiedDate: string;
    ordering: number;
    releaseDate: string;
    status: number;
    title: string;
    video: {
      content: string;
      createdDate: string;
      description: string;
      duration: number;
      id: string;
      introEnd: number;
      introStart: number;
      modifiedDate: string;
      name: string;
      outroStart: number;
      relativeContentPath: string;
      shortDescription: string;
      spriteUrl: string;
      state: number;
      status: number;
      thumbnailUrl: string;
      vttUrl: string;
    };
  }[];
  slug: string;
  status: number;
  thumbnailUrl: string;
  title: string;
  type: number;
  viewCount: number;
};

export type MovieBodyType = z.infer<typeof movieSchema>;

export type MovieSearchType = z.infer<typeof movieSearchSchema> &
  BaseSearchType;
