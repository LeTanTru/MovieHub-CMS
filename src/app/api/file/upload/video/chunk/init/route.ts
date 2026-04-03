import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

function generateRandomFileName(length = 10): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function POST(req: NextRequest) {
  const { mimeType } = await req.json();

  const randomName = generateRandomFileName(10);
  const ext =
    mimeType === 'video/quicktime'
      ? 'mov'
      : mimeType === 'video/webm'
        ? 'webm'
        : mimeType === 'video/ogg'
          ? 'ogg'
          : 'mp4';

  const objectName = `${process.env.MINIO_UPLOAD_FOLDER}/${process.env.MINIO_UPLOAD_PREFIX}_${randomName}.${ext}`;

  // Create multipart upload
  const { UploadId } = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      ContentType: mimeType
    })
  );

  return NextResponse.json({ uploadId: UploadId, objectName });
}
