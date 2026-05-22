import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import {
  getCookie,
  validateCsrfToken,
  csrfErrorResponse,
  decodeJwt,
  validatePermission
} from '@/utils';
import { storageKeys, apiConfig } from '@/constants';
import {
  completeMultipartUploadSchema,
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
      requiredPermissions: [apiConfig.file.uploadChunkComplete.permissionCode],
      userPermissions: permissionCodes
    })
  ) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: HttpStatusCode.Forbidden }
    );
  }

  const parsedBody = await parseRequestBody(req, completeMultipartUploadSchema);

  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { objectName, uploadId, parts } = parsedBody.data;

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
      { filePath: `/${BUCKET_NAME}/${objectName}` },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { message: 'Multipart upload failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
