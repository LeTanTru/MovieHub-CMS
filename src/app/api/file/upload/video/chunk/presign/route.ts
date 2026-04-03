import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: NextRequest) {
  const { objectName, uploadId, partNumber } = await req.json();

  // Create presigned URL for uploading a part
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: objectName,
    UploadId: uploadId,
    PartNumber: partNumber
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return NextResponse.json({ url });
}
