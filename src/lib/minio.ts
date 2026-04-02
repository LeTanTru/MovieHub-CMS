import * as Minio from 'minio';

const url = new URL(process.env.MINIO_ENDPOINT!);

export const minioClient = new Minio.Client({
  endPoint: url.hostname,
  port: url.port ? Number(url.port) : undefined,
  useSSL: url.protocol === 'https:',
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!
});

export const BUCKET_NAME = process.env.MINIO_BUCKET!;

export async function uploadVideo(
  buffer: Buffer,
  fileName: string,
  mimeType: string
) {
  const objectName = `tmp/VIDEO_${fileName}.mp4`;

  await new Promise<void>((resolve, reject) => {
    minioClient
      .putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
        'Content-Type': mimeType
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });

  return `/moviehub/${objectName}`;
}

export async function getVideoUrl(
  objectName: string,
  expirySeconds = 60 * 60 * 24
) {
  return minioClient.presignedGetObject(BUCKET_NAME, objectName, expirySeconds);
}
