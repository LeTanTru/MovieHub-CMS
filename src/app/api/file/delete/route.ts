import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import {
  decodeJwt,
  getCookie,
  validatePermission,
  validateCsrfToken,
  csrfErrorResponse
} from '@/utils';
import { storageKeys, apiConfig } from '@/constants';

export async function DELETE(req: NextRequest) {
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
      requiredPermissions: [apiConfig.file.deleteObject.permissionCode],
      userPermissions: permissionCodes
    })
  ) {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: HttpStatusCode.Forbidden }
    );
  }

  try {
    const { objectName } = await req.json();

    if (!objectName) {
      return NextResponse.json(
        { message: 'Missing objectName parameter' },
        { status: HttpStatusCode.BadRequest }
      );
    }

    let key = objectName;
    const prefix = `/${BUCKET_NAME}/`;
    if (key.startsWith(prefix)) {
      key = key.substring(prefix.length);
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      })
    );

    return NextResponse.json(
      { message: 'Object deleted successfully', objectName },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[DELETE_OBJECT_ERROR]', error);
    return NextResponse.json(
      { message: 'Delete object failed' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
