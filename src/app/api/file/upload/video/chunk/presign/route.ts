import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie } from '@/utils';
import { storageKeys } from '@/constants';
import { z } from 'zod';
import { presignSchema } from '../validation';

export async function POST(req: NextRequest) {
  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  if (!BUCKET_NAME) {
    logger.error('[PRESIGN_ERROR]', 'Missing BUCKET_NAME configuration');
    return NextResponse.json(
      { error: 'Server configuration error: Missing bucket name' },
      { status: HttpStatusCode.InternalServerError }
    );
  }

  const body = await req.json();
  const parsed = presignSchema.safeParse(body);

  if (!parsed.success) {
    logger.error(
      '[PRESIGN_ERROR]',
      'Invalid parameters:',
      z.treeifyError(parsed.error)
    );
    return NextResponse.json(
      { error: 'Invalid parameters', details: z.treeifyError(parsed.error) },
      { status: HttpStatusCode.BadRequest }
    );
  }

  const { objectName, uploadId, partNumber } = parsed.data;

  logger.info(
    `[Presign] Creating presigned URL - Bucket: ${BUCKET_NAME}, Key: ${objectName}, Part: ${partNumber}`
  );

  try {
    const command = new UploadPartCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      UploadId: uploadId,
      PartNumber: partNumber
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    logger.info(`[Presign] Success - Part ${partNumber}`);

    return NextResponse.json({ url }, { status: HttpStatusCode.Ok });
  } catch (error) {
    logger.error('[CREATE_PRESIGNED_URL_ERROR]', error);
    return NextResponse.json(
      { message: 'Create presigned URL failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
