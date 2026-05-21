import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getCookie, validateCsrfToken, csrfErrorResponse } from '@/utils';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { storageKeys } from '@/constants';
import {
  abortMultipartUploadSchema,
  parseRequestBody
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

  const parsedBody = await parseRequestBody(req, abortMultipartUploadSchema);

  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { objectName, uploadId } = parsedBody.data;

  try {
    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        UploadId: uploadId
      })
    );

    return new NextResponse(
      JSON.stringify(
        { message: 'Multipart upload aborted successfully' },
        null,
        2
      ),
      {
        status: HttpStatusCode.Ok,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logger.error('[ABORT_MULTIPART_UPLOAD_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Abort multipart upload failed' }, null, 2),
      {
        status: HttpStatusCode.BadRequest,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
