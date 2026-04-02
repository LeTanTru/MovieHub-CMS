'use server';

import { minioClient, BUCKET_NAME } from '@/lib/minio';

export async function getPresignedUrl(fileName: string) {
  return minioClient.presignedGetObject(BUCKET_NAME, fileName, 60 * 60); // 1h
}

export async function deleteFile(fileName: string) {
  await minioClient.removeObject(BUCKET_NAME, fileName);
}
