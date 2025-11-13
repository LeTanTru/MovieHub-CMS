import { profileSchema } from '@/schemaValidations';
import z from 'zod';

export type ProfileResType = {
  id: string;
  status: number;
  kind: number;
  username: string;
  phone: string;
  email: string;
  fullName: string;
  group: {
    id: string;
    status: number;
    modifiedDate: string;
    createdDate: string;
    name: string;
    description: string;
    kind: number;
    subKind: number;
    isSystemRole: boolean;
  };
  avatarPath: string;
  logoPath: string;
};

export type ProfileBodyType = z.infer<typeof profileSchema>;
