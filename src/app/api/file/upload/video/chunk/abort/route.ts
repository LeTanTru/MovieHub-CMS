import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import { NextRequest, NextResponse } from 'next/server';
import {
  getCookie,
  validateCsrfToken,
  csrfErrorResponse,
  decodeJwt,
  validatePermission
} from '@/utils';
import { storageKeys, apiConfig } from '@/constants';
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
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  const permissionCodes = decodeJwt(accessToken)?.authorities || [];

  if (
    !validatePermission({
      requiredPermissions: [apiConfig.file.uploadChunkAbort.permissionCode],
      userPermissions: permissionCodes
    })
  ) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: HttpStatusCode.Forbidden }
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

    return NextResponse.json(
      { message: 'Multipart upload aborted successfully' },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[ABORT_MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { message: 'Abort multipart upload failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
