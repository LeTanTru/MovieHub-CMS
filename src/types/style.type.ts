import { styleSchema, styleSearchSchema } from '@/schemaValidations';
import z from 'zod';

export type StyleResType = {
  createdDate: string;
  description: string;
  id: string;
  imageUrl: string;
  isDefault: boolean;
  modifiedDate: string;
  name: string;
  status: number;
  type: number;
};

export type StyleBodyType = z.infer<typeof styleSchema>;

export type StyleSearchType = z.infer<typeof styleSearchSchema>;
