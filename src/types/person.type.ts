import { personSchema, personSearchSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type PersonResType = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  name: string;
  otherName: string;
  avatarPath: string;
  bio: string;
  gender: number;
  dateOfBirth: string;
  country: string;
  kinds: number[];
};

export type PersonBodyType = z.infer<typeof personSchema>;

export type PersonSearchType = z.infer<typeof personSearchSchema> &
  BaseSearchType;
