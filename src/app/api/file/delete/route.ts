import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import {
  DeleteObjectCommand,
  GetObjectTaggingCommand
} from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';
import { decodeJwt, getCookie, validatePermission } from '@/utils';
import { storageKeys, GROUP_KIND_ADMIN, apiConfig } from '@/constants';

export async function DELETE(req: NextRequest) {
  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
  const userKind = await getCookie(storageKeys.USER_KIND);

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
      {
        message: 'Forbidden'
      },
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

    // Ownership validation (IDOR prevention)
    if (userKind !== String(GROUP_KIND_ADMIN)) {
      let userId = 'unknown';
      try {
        const payload = decodeJwt(accessToken);
        if (payload) {
          userId = payload.user_id || payload.user_name || 'unknown';
        }
      } catch (err) {
        logger.error('[JWT_DECODE_ERROR]', err);
      }

      try {
        const tagResponse = await s3Client.send(
          new GetObjectTaggingCommand({ Bucket: BUCKET_NAME, Key: key })
        );
        const uploadedByTag = tagResponse.TagSet?.find(
          (t) => t.Key === 'uploadedBy'
        )?.Value;

        if (!uploadedByTag || uploadedByTag !== userId) {
          logger.warn(
            `[DELETE_FORBIDDEN] User ${userId} attempted to delete object ${key} owned by ${uploadedByTag}`
          );
          return NextResponse.json(
            {
              message: 'Forbidden'
            },
            { status: HttpStatusCode.Forbidden }
          );
        }
      } catch (tagError) {
        logger.error('[GET_OBJECT_TAGGING_ERROR]', tagError);
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: HttpStatusCode.Forbidden }
        );
      }
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      })
    );

    return NextResponse.json(
      {
        message: 'Object deleted successfully',
        objectName
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[DELETE_OBJECT_ERROR]', error);
    return NextResponse.json(
      {
        message: 'Delete object failed'
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
