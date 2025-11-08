import { DATE_TIME_FORMAT } from '@/constants';
import { parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import z from 'zod';

export const businessSearchSchema = z.object({
  businessName: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  expireDateFrom: z.string().optional().nullable(),
  expireDateTo: z.string().optional().nullable(),
  status: z.number().optional().nullable()
});

const futureDateCheck = (fieldName: string) =>
  z
    .string()
    .nonempty(`${fieldName} bắt buộc`)
    .refine(
      (value) => {
        try {
          const date = parse(value, DATE_TIME_FORMAT, new Date(), {
            locale: vi
          });
          if (isNaN(date.getTime())) return false;
          return date.getTime() > Date.now();
        } catch {
          return false;
        }
      },
      {
        message: `${fieldName} phải nằm trong tương lai`
      }
    );

export const businessSchema = z.object({
  address: z.string().nonempty('Bắt buộc'),
  bannerPath: z.string().nonempty('Bắt buộc'),
  city: z.string().nonempty('Bắt buộc'),
  customerId: z.string().nonempty('Bắt buộc'),
  expireDate: futureDateCheck('Ngày hết hạn'),
  extDate: futureDateCheck('Ngày gia hạn'),
  hotline: z.string().nonempty('Bắt buộc'),
  lang: z.string().nonempty('Bắt buộc'),
  logoPath: z.string().nonempty('Bắt buộc'),
  name: z.string().nonempty('Bắt buộc'),
  note: z.string().nonempty('Bắt buộc'),
  settings: z.string().optional().nullable(),
  status: z.number({ error: 'Bắt buộc' }),
  taxNumber: z.string().nonempty('Bắt buộc'),
  tenantId: z.string().nonempty('Bắt buộc'),
  zipCode: z.string().nonempty('Bắt buộc')
});
