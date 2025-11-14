import { personSchema, personSearchSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type PersonResType = {
  avatarPath: string;
  bio: string;
  country: string;
  createdDate: string;
  dateOfBirth: string;
  gender: number;
  id: string;
  kinds: number[];
  modifiedDate: string;
  name: string;
  otherName: string;
  status: number;
};

export type PersonBodyType = z.infer<typeof personSchema>;

export type PersonSearchType = z.infer<typeof personSearchSchema> &
  BaseSearchType;
