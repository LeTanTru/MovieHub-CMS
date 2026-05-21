import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie, validateCsrfToken, csrfErrorResponse } from '@/utils';
import { storageKeys } from '@/constants';
import {
  parseRequestBody,
  presignMultipartUploadSchema
} from '../_lib/validation';

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

  if (!BUCKET_NAME) {
    logger.error('[PRESIGN_ERROR]', 'Missing BUCKET_NAME configuration');
    return new NextResponse(
      JSON.stringify(
        { error: 'Server configuration error: Missing bucket name' },
        null,
        2
      ),
      {
        status: HttpStatusCode.InternalServerError,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const parsedBody = await parseRequestBody(req, presignMultipartUploadSchema);

  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { objectName, uploadId, partNumber } = parsedBody.data;

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

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 }); // 1h

    logger.info(`[Presign] Success - Part ${partNumber}`);

    return new NextResponse(JSON.stringify({ url }, null, 2), {
      status: HttpStatusCode.Ok,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('[CREATE_PRESIGNED_URL_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Create presigned URL failed' }, null, 2),
      {
        status: HttpStatusCode.BadRequest,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
