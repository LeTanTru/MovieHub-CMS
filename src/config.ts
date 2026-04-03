import { logger } from './logger';
import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_NODE_ENV: z.string(),
  NEXT_PUBLIC_AUTH_API_URL: z.url(),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_API_MEDIA_URL: z.url(),
  NEXT_PUBLIC_APP_USERNAME: z.string(),
  NEXT_PUBLIC_APP_PASSWORD: z.string(),
  NEXT_PUBLIC_URL: z.url(),
  NEXT_PUBLIC_TINYMCE_URL: z.url(),
  NEXT_PUBLIC_API_SOCKET_URL: z.url(),
  NEXT_PUBLIC_GRANT_TYPE: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN: z.string(),
  NEXT_PUBLIC_MEDIA_HOST: z.string(),
  NEXT_PUBLIC_CLIENT_TYPE: z.string(),
  // MinIO Configuration
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MINIO_BUCKET: z.string(),
  MINIO_UPLOAD_FOLDER: z.string(),
  MINIO_UPLOAD_PREFIX: z.string()
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_MEDIA_URL: process.env.NEXT_PUBLIC_API_MEDIA_URL,
  NEXT_PUBLIC_APP_USERNAME: process.env.NEXT_PUBLIC_APP_USERNAME,
  NEXT_PUBLIC_APP_PASSWORD: process.env.NEXT_PUBLIC_APP_PASSWORD,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_TINYMCE_URL: process.env.NEXT_PUBLIC_TINYMCE_URL,
  NEXT_PUBLIC_API_SOCKET_URL: process.env.NEXT_PUBLIC_API_SOCKET_URL,
  NEXT_PUBLIC_GRANT_TYPE: process.env.NEXT_PUBLIC_GRANT_TYPE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN:
    process.env.NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN,
  NEXT_PUBLIC_MEDIA_HOST: process.env.NEXT_PUBLIC_MEDIA_HOST,
  NEXT_PUBLIC_CLIENT_TYPE: process.env.NEXT_PUBLIC_CLIENT_TYPE,
  // MinIO Configuration
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_ROOT_USER: process.env.MINIO_ROOT_USER,
  MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD,
  MINIO_BUCKET: process.env.MINIO_BUCKET,
  MINIO_UPLOAD_FOLDER: process.env.MINIO_UPLOAD_FOLDER,
  MINIO_UPLOAD_PREFIX: process.env.MINIO_UPLOAD_PREFIX
});

if (!configProject.success) {
  logger.error('Invalid environment variables:', configProject.error);
  throw new Error('Các khai báo biến môi trường không hợp lệ');
}

const envConfig = configProject.data;

export default envConfig;
