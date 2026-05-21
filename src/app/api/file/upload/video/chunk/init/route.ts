import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME, UPLOAD_FOLDER, UPLOAD_PREFIX } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie, validateCsrfToken, csrfErrorResponse } from '@/utils';
import { storageKeys } from '@/constants';
import {
  getVideoExtensionFromMimeType,
  initMultipartUploadSchema,
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

  const parsedBody = await parseRequestBody(req, initMultipartUploadSchema);

  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { mimeType } = parsedBody.data;
  const randomName = randomBytes(10).toString('hex');
  const ext = getVideoExtensionFromMimeType(mimeType);
  const objectName = `${UPLOAD_FOLDER}/${UPLOAD_PREFIX}_${randomName}.${ext}`;

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
