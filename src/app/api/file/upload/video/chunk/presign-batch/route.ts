import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/logger';
import { HttpStatusCode } from 'axios';
import { getCookie, validateCsrfToken, csrfErrorResponse } from '@/utils';
import { storageKeys } from '@/constants';
import {
  parseRequestBody,
  objectNameSchema,
  uploadIdSchema,
  partNumberSchema
} from '../_lib/validation';
import { z } from 'zod';

const PRESIGN_EXPIRES_IN = 60 * 60; // 1 hour
const MAX_BATCH_PARTS = 10_000;

const batchPresignSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema,
  partNumbers: z.array(partNumberSchema).min(1).max(MAX_BATCH_PARTS)
});

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

  if (!BUCKET_NAME) {
    logger.error('[PRESIGN_BATCH_ERROR]', 'Missing BUCKET_NAME configuration');
    return NextResponse.json(
      { error: 'Server configuration error: Missing bucket name' },
      { status: HttpStatusCode.InternalServerError }
    );
  }

  const parsedBody = await parseRequestBody(req, batchPresignSchema);

  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { objectName, uploadId, partNumbers } = parsedBody.data;

  logger.info(
    `[PresignBatch] Generating ${partNumbers.length} URLs - Bucket: ${BUCKET_NAME}, Key: ${objectName}`
  );

  try {
    // Generate all presigned URLs in parallel — no serial bottleneck
    const urls = await Promise.all(
      partNumbers.map((partNumber) => {
        const command = new UploadPartCommand({
          Bucket: BUCKET_NAME,
          Key: objectName,
          UploadId: uploadId,
          PartNumber: partNumber
        });
        return getSignedUrl(s3Client, command, {
          expiresIn: PRESIGN_EXPIRES_IN
        });
      })
    );

    // Return as a map: { [partNumber]: url }
    const urlMap: Record<number, string> = {};
    partNumbers.forEach((partNumber, i) => {
      urlMap[partNumber] = urls[i];
    });

    logger.info(
      `[PresignBatch] Success - ${partNumbers.length} URLs generated`
    );

    return NextResponse.json({ urls: urlMap }, { status: HttpStatusCode.Ok });
  } catch (error) {
    logger.error('[PRESIGN_BATCH_ERROR]', error);
    return NextResponse.json(
      { message: 'Batch presign failed' },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
