import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import { getCookie } from '@/utils';
import { storageKeys } from '@/constants';
import { z } from 'zod';
import { completeSchema } from '../validation';

export async function POST(req: NextRequest) {
  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  const body = await req.json();
  const parsed = completeSchema.safeParse(body);

  if (!parsed.success) {
    logger.error(
      '[MULTIPART_UPLOAD_ERROR]',
      'Invalid parameters:',
      z.treeifyError(parsed.error)
    );
    return NextResponse.json(
      { error: 'Invalid parameters', details: z.treeifyError(parsed.error) },
      { status: HttpStatusCode.BadRequest }
    );
  }

  const { objectName, uploadId, parts } = parsed.data;

  try {
    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p) => ({
            PartNumber: p.partNumber,
            ETag: p.etag
          }))
        }
      })
    );

    return NextResponse.json(
      {
        filePath: `/${BUCKET_NAME}/${objectName}`
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      {
        message: 'Multipart upload failed'
      },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
