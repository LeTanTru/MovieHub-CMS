import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { HttpStatusCode } from 'axios';
import { logger } from '@/logger';

export async function POST(req: NextRequest) {
  const { objectName, uploadId, parts } = await req.json();

  try {
    // Complete multipart upload
    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p: { partNumber: number; etag: string }) => ({
            PartNumber: p.partNumber,
            ETag: p.etag
          }))
        }
      })
    );

    return NextResponse.json(
      {
        filePath: `/${BUCKET_NAME}/${objectName}`
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('Error completing multipart upload:', error);
    return NextResponse.json(
      { error: 'Error completing multipart upload' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
