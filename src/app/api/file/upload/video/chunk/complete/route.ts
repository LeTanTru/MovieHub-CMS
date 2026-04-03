import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  const { objectName, uploadId, parts } = await req.json();

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

  return NextResponse.json({
    filePath: `/${BUCKET_NAME}/${objectName}`
  });
}
