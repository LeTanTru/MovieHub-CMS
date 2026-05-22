import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME, UPLOAD_FOLDER, UPLOAD_PREFIX } from '@/lib/s3';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import {
  getCookie,
  validateCsrfToken,
  csrfErrorResponse,
  decodeJwt,
  validatePermission
} from '@/utils';
import { storageKeys, apiConfig } from '@/constants';
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
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  const permissionCodes = decodeJwt(accessToken)?.authorities || [];

  if (
    !validatePermission({
      requiredPermissions: [apiConfig.file.uploadChunkInit.permissionCode],
      userPermissions: permissionCodes
    })
  ) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: HttpStatusCode.Forbidden }
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

    return NextResponse.json(
      { uploadId: UploadId, objectName },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[CREATE_MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { message: 'Create multipart upload failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
