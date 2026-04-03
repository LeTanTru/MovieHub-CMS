import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';

export async function POST(req: NextRequest) {
  const { objectName, uploadId, partNumber } = await req.json();

  // Validate inputs
  if (!BUCKET_NAME) {
    logger.error('[Presign] Missing BUCKET_NAME configuration');
    return NextResponse.json(
      { error: 'Server configuration error: Missing bucket name' },
      { status: HttpStatusCode.InternalServerError }
    );
  }

  if (!objectName || !uploadId || !partNumber) {
    logger.error('[Presign] Missing required parameters:', {
      objectName,
      uploadId,
      partNumber
    });
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: HttpStatusCode.BadRequest }
    );
  }

  logger.info(
    `[Presign] Creating presigned URL - Bucket: ${BUCKET_NAME}, Key: ${objectName}, Part: ${partNumber}`
  );

  try {
    // Create presigned URL for uploading a part
    const command = new UploadPartCommand({
      Bucket: BUCKET_NAME,
      Key: objectName,
      UploadId: uploadId,
      PartNumber: partNumber
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    logger.info(`[Presign] Success - Part ${partNumber}`);

    return NextResponse.json({ url }, { status: HttpStatusCode.Ok });
  } catch (error) {
    logger.error('[Presign] Error creating presigned URL:', error);
    return NextResponse.json(
      { error: 'Error creating presigned URL' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
