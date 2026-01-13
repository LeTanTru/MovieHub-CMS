import {
  movieSidebarSchema,
  movieSidebarSearchSchema
} from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type MovieSidebarResType = {
  active: boolean;
  createdDate: string;
  description: string;
  id: string;
  mainColor: string;
  mobileThumbnailUrl: string;
  modifiedDate: string;
  movie: {
    ageRating: number;
    categories: {
      createdDate: string;
      id: string;
      modifiedDate: string;
      name: string;
      slug: string;
      status: number;
    }[];
    country: string;
    createdDate: string;
    description: string;
    id: number;
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
      thumbnailUrl: string;
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
        sourceType: number;
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
  ordering: number;
  status: number;
  webThumbnailUrl: string;
};

export type MovieSidebarBodyType = z.infer<typeof movieSidebarSchema>;

export type MovieSidebarSearchType = z.infer<typeof movieSidebarSearchSchema> &
  BaseSearchType;
