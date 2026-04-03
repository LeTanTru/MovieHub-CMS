import { S3Client } from '@aws-sdk/client-s3';
import { logger } from '@/logger';

const requiredEnvVars = {
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_ROOT_USER: process.env.MINIO_ROOT_USER,
  MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD,
  MINIO_BUCKET: process.env.MINIO_BUCKET,
  MINIO_UPLOAD_FOLDER: process.env.MINIO_UPLOAD_FOLDER,
  MINIO_UPLOAD_PREFIX: process.env.MINIO_UPLOAD_PREFIX
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
  endpoint: process.env.MINIO_ENDPOINT!,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER!,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD!
  },
  forcePathStyle: true // required for MinIO
});

export const BUCKET_NAME = process.env.MINIO_BUCKET;
export const UPLOAD_FOLDER = process.env.MINIO_UPLOAD_FOLDER;
export const UPLOAD_PREFIX = process.env.MINIO_UPLOAD_PREFIX;
