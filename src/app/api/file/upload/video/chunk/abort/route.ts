import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';

export async function POST(req: NextRequest) {
  const { objectName, uploadId } = await req.json();

  try {
    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        UploadId: uploadId
      })
    );

    return NextResponse.json(
      {
        message: 'Multipart upload aborted successfully'
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[ABORT_MULTIPART_UPLOAD_ERROR]', error);
    return NextResponse.json(
      {
        message: 'Abort multipart upload failed'
      },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
