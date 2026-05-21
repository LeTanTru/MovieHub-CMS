import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie, validateCsrfToken, csrfErrorResponse } from '@/utils';
import { storageKeys } from '@/constants';

export async function POST(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return csrfErrorResponse();
  }

  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);

  if (!accessToken) {
    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized' }, null, 2),
      {
        status: HttpStatusCode.Unauthorized,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const body = await req.json();

  const { mimeType } = body;
  const randomName = randomBytes(10).toString('hex');
  const ext =
    mimeType === 'video/quicktime'
      ? 'mov'
      : mimeType === 'video/webm'
        ? 'webm'
        : mimeType === 'video/ogg'
          ? 'ogg'
          : 'mp4';

  const objectName = `${process.env.MINIO_UPLOAD_FOLDER}/${process.env.MINIO_UPLOAD_PREFIX}_${randomName}.${ext}`;

  try {
    const { UploadId } = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        ContentType: mimeType
      })
    );

    return new NextResponse(
      JSON.stringify({ uploadId: UploadId, objectName }, null, 2),
      {
        status: HttpStatusCode.Ok,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logger.error('[CREATE_MULTIPART_UPLOAD_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Create multipart upload failed' }, null, 2),
      {
        status: HttpStatusCode.BadRequest,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
