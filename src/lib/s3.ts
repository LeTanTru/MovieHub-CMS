import { S3Client } from '@aws-sdk/client-s3';
import { logger } from '@/logger';
import envConfig from '@/config';

const requiredEnvVars = {
  MINIO_ENDPOINT: envConfig.MINIO_ENDPOINT,
  MINIO_ROOT_USER: envConfig.MINIO_ROOT_USER,
  MINIO_ROOT_PASSWORD: envConfig.MINIO_ROOT_PASSWORD,
  MINIO_BUCKET: envConfig.MINIO_BUCKET,
  MINIO_UPLOAD_FOLDER: envConfig.MINIO_UPLOAD_FOLDER,
  MINIO_UPLOAD_PREFIX: envConfig.MINIO_UPLOAD_PREFIX
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  logger.error(
    `[S3 Config] Missing required environment variables: ${missingVars.join(', ')}`
  );
  logger.error('[S3 Config] Please check your .env file');
}

export const s3Client = new S3Client({
  endpoint: envConfig.MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: envConfig.MINIO_ROOT_USER,
    secretAccessKey: envConfig.MINIO_ROOT_PASSWORD
  },
  forcePathStyle: true // required for MinIO
});

export const BUCKET_NAME = envConfig.MINIO_BUCKET;
export const UPLOAD_FOLDER = envConfig.MINIO_UPLOAD_FOLDER;
export const UPLOAD_PREFIX = envConfig.MINIO_UPLOAD_PREFIX;
