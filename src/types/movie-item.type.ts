import { movieItemSchema, movieItemSearchSchema } from '@/schemaValidations';
import { MovieResType } from '@/types/movie.type';
import { BaseSearchType } from '@/types/search.type';
import { VideoLibraryResType } from '@/types/video-library.type';
import z from 'zod';

export type MovieItemResType = {
  createdDate: string;
  description: string;
  episodes: any[];
  id: string;
  kind: number;
  label: string;
  modifiedDate: string;
  movie: MovieResType;
  ordering: number;
  releaseDate: string;
  status: number;
  title: string;
  video: VideoLibraryResType;
};

export type MovieItemBodyType = z.infer<typeof movieItemSchema>;

export type MovieItemSearchType = z.infer<typeof movieItemSearchSchema> &
  BaseSearchType;
