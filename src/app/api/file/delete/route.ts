import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';

export async function DELETE(req: NextRequest) {
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

export { DELETE as POST };
