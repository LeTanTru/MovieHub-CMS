import {
  moviePersonSchema,
  moviePersonSearchSchema
} from '@/schemaValidations';
import { MovieResType } from '@/types/movie.type';
import { PersonResType } from '@/types/person.type';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

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
