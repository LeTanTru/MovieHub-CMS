import { styleSchema, styleSearchSchema } from '@/schema-validations';
import { z } from 'zod';

export type StyleResType = {
  createdDate: string;
  description: string;
  id: string;
  imageMobileUrl: string;
  imageWebUrl: string;
  isDefault: boolean;
  modifiedDate: string;
  name: string;
  status: number;
  type: number;
};

export type StyleBodyType = z.infer<typeof styleSchema>;

export type StyleSearchType = z.infer<typeof styleSearchSchema>;
