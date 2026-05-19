import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie } from '@/utils';
import { storageKeys } from '@/constants';
import { z } from 'zod';
import { initSchema } from '../validation';

export async function POST(req: NextRequest) {
  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  const body = await req.json();
  const parsed = initSchema.safeParse(body);

  if (!parsed.success) {
    logger.error(
      '[INIT_UPLOAD_ERROR]',
      'Invalid parameters:',
      z.treeifyError(parsed.error)
    );
    return NextResponse.json(
      { error: 'Invalid parameters', details: z.treeifyError(parsed.error) },
      { status: HttpStatusCode.BadRequest }
    );
  }

  const { mimeType } = parsed.data;

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
    // Create multipart upload
    const { UploadId } = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        ContentType: mimeType
      })
    );
    return NextResponse.json(
      {
        uploadId: UploadId,
        objectName: objectName
      },
      {
        status: HttpStatusCode.Ok
      }
    );
  } catch (error) {
    logger.error('[CREATE_MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { message: 'Create multipart upload failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
