import { movieItemSchema, movieItemSearchSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import { VideoLibraryResType } from '@/types/video-library.type';
import z from 'zod';

export type MovieItemResType = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  title: string;
  description: string;
  kind: number;
  label: string;
  ordering: number;
  parent: {
    id: string;
    status: number;
    title: string;
    kind: number;
    label: string;
    ordering: number;
    releaseDate: string;
  };
  movie: {
    id: string;
    title: string;
    originalTitle: string;
    thumbnailUrl: string;
    releaseDate: string;
    type: number;
  };
  thumbnailUrl: string;
  video: VideoLibraryResType;
  releaseDate: string;
};

export type MovieItemBodyType = z.infer<typeof movieItemSchema>;

export type MovieItemSearchType = z.infer<typeof movieItemSearchSchema> &
  BaseSearchType;
