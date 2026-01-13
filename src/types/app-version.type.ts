import { appVersionSchema, appVersionSearchSchema } from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type AppVersionResType = {
  changeLog: string;
  code: number;
  createdDate: string;
  filePath: string;
  forceUpdate: boolean;
  id: string;
  isLatest: boolean;
  modifiedDate: string;
  name: string;
  status: number;
};

export type AppVersionBodyType = z.infer<typeof appVersionSchema>;

export type AppVersionSearchType = z.infer<typeof appVersionSearchSchema> &
  BaseSearchType;
