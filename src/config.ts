import { logger } from '@/logger';
import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_NODE_ENV: z.string(),
  NEXT_PUBLIC_API_META_ENDPOINT_URL: z.url(),
  NEXT_PUBLIC_API_TENANT_ENDPOINT_URL: z.url(),
  NEXT_PUBLIC_TENANT_ID: z.string().min(1).max(100),
  NEXT_PUBLIC_URL: z.string().optional(),
  NEXT_PUBLIC_TINYMCE_URL: z.string(),
  NEXT_PUBLIC_API_MEDIA_URL: z.string(),
  NEXT_PUBLIC_GRANT_TYPE: z.string(),
  NEXT_PUBLIC_APP_USERNAME: z.string(),
  NEXT_PUBLIC_APP_PASSWORD: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_API_SOCKET: z.string(),
  NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN: z.string()
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_API_META_ENDPOINT_URL:
    process.env.NEXT_PUBLIC_API_META_ENDPOINT_URL,
  NEXT_PUBLIC_API_TENANT_ENDPOINT_URL:
    process.env.NEXT_PUBLIC_API_TENANT_ENDPOINT_URL,
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_TINYMCE_URL: process.env.NEXT_PUBLIC_TINYMCE_URL,
  NEXT_PUBLIC_API_MEDIA_URL: process.env.NEXT_PUBLIC_API_MEDIA_URL,
  NEXT_PUBLIC_GRANT_TYPE: process.env.NEXT_PUBLIC_GRANT_TYPE,
  NEXT_PUBLIC_APP_USERNAME: process.env.NEXT_PUBLIC_APP_USERNAME,
  NEXT_PUBLIC_APP_PASSWORD: process.env.NEXT_PUBLIC_APP_PASSWORD,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_SOCKET: process.env.NEXT_PUBLIC_API_SOCKET,
  NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN:
    process.env.NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN
});

if (!configProject.success) {
  logger.error('Invalid environment variables:', configProject.error);
  throw new Error('Các khai báo biến môi trường không hợp lệ');
}

const envConfig = configProject.data;

export default envConfig;
