import {
  movieSidebarSchema,
  movieSidebarSearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type MovieSidebarResType = {
  active: boolean;
  createdDate: string;
  description: string;
  id: string;
  mainColor: string;
  mobileThumbnailUrl: string;
  modifiedDate: string;
  movieItem: {
    createdDate: string;
    description: string;
    episodes: any[];
    id: string;
    kind: number;
    label: string;
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
      id: string;
      isFeatured: boolean;
      language: string;
      modifiedDate: string;
      originalTitle: string;
      posterUrl: string;
      releaseDate: string;
      seasons: any[];
      slug: string;
      status: number;
      thumbnailUrl: string;
      title: string;
      type: number;
      viewCount: number;
    };
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
      spriteUrl: string;
      state: number;
      status: number;
      thumbnailUrl: string;
      vttUrl: string;
    };
  };
  ordering: number;
  status: number;
  webThumbnailUrl: string;
};

export type MovieSidebarBodyType = z.infer<typeof movieSidebarSchema>;

export type MovieSidebarSearchType = z.infer<typeof movieSidebarSearchSchema> &
  BaseSearchType;
