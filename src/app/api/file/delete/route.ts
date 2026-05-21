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
    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized' }, null, 2),
      {
        status: HttpStatusCode.Unauthorized,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const permissionCodes = decodeJwt(accessToken)?.authorities || [];

  if (
    !validatePermission({
      requiredPermissions: [apiConfig.file.deleteObject.permissionCode],
      userPermissions: permissionCodes
    })
  ) {
    return new NextResponse(JSON.stringify({ message: 'Forbidden' }, null, 2), {
      status: HttpStatusCode.Forbidden,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { objectName } = await req.json();

    if (!objectName) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing objectName parameter' }, null, 2),
        {
          status: HttpStatusCode.BadRequest,
          headers: { 'Content-Type': 'application/json' }
        }
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

    return new NextResponse(
      JSON.stringify(
        { message: 'Object deleted successfully', objectName },
        null,
        2
      ),
      {
        status: HttpStatusCode.Ok,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logger.error('[DELETE_OBJECT_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Delete object failed' }, null, 2),
      {
        status: HttpStatusCode.InternalServerError,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
