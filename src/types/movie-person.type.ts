import {
  moviePersonSchema,
  moviePersonSearchSchema
} from '@/schemaValidations';
import type { MovieResType } from '@/types/movie.type';
import type { PersonResType } from '@/types/person.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type MoviePersonResType = {
  characterName: string;
  createdDate: string;
  id: string;
  kind: number;
  modifiedDate: string;
  movie: MovieResType;
  ordering: number;
  person: PersonResType;
  status: number;
};

export type MoviePersonBodyType = z.infer<typeof moviePersonSchema>;

export type MoviePersonSearchType = z.infer<typeof moviePersonSearchSchema> &
  BaseSearchType;
