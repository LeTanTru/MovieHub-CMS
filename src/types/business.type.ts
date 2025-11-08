import { businessSchema, businessSearchSchema } from '@/schemaValidations';
import { CustomerResType } from '@/types/customer.type';
import { BaseSearchType } from '@/types/search.type';
import { ServerProviderResType } from '@/types/server-provider.type';
import z from 'zod';

export type BusinessResType = {
  id: string;
  status: number;
  name: string;
  logoPath: string;
  bannerPath: string;
  hotline: string;
  settings: string;
  lang: string;
  serverProviderDto: ServerProviderResType;
  customer: CustomerResType;
  address: string;
  city: string;
  zipCode: string;
  taxNumber: string;
  tenantId: string;
  businessTenantId: string;
  expireDate: string;
  extDate: string;
  note: string;
  createdDate: string;
};

export type BusinessSearchType = z.infer<typeof businessSearchSchema> &
  BaseSearchType;

export type BusinessBodyType = z.infer<typeof businessSchema>;
